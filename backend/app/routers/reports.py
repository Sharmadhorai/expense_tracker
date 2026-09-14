from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, timedelta
from decimal import Decimal
import calendar

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", response_model=schemas.ReportSummary)
def get_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    if start_date:
        base = base.filter(models.Transaction.date >= start_date)
    if end_date:
        base = base.filter(models.Transaction.date <= end_date)

    income = base.filter(models.Transaction.type == "income").with_entities(func.sum(models.Transaction.amount)).scalar() or Decimal("0")
    expenses = base.filter(models.Transaction.type == "expense").with_entities(func.sum(models.Transaction.amount)).scalar() or Decimal("0")
    count = base.count()
    net = Decimal(str(income)) - Decimal(str(expenses))

    return schemas.ReportSummary(
        total_income=income,
        total_expenses=expenses,
        net=net,
        balance=net,
        transaction_count=count,
        total_transactions=count,
    )


@router.get("/category-breakdown", response_model=List[schemas.CategoryBreakdown])
def get_category_breakdown(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    type: str = Query("expense"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(
        models.Transaction.category_id,
        func.sum(models.Transaction.amount).label("total"),
        models.Category.name,
        models.Category.icon,
        models.Category.color,
    ).join(
        models.Category, models.Transaction.category_id == models.Category.id, isouter=True
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == type,
    )
    if start_date:
        q = q.filter(models.Transaction.date >= start_date)
    if end_date:
        q = q.filter(models.Transaction.date <= end_date)

    rows = q.group_by(models.Transaction.category_id).all()
    grand_total = sum(r.total for r in rows) or Decimal("0")

    result = []
    for r in rows:
        pct = (float(r.total) / float(grand_total) * 100) if grand_total else 0
        result.append(schemas.CategoryBreakdown(
            category_id=r.category_id,
            category_name=r.name or "Uncategorized",
            category_icon=r.icon or "📦",
            category_color=r.color or "#B0B0B0",
            total=r.total,
            percentage=round(pct, 2),
        ))
    return sorted(result, key=lambda x: x.total, reverse=True)


@router.get("/monthly-trend", response_model=List[schemas.TrendPoint])
@router.get("/trend", response_model=List[schemas.TrendPoint])
def get_trend(
    period: str = Query("monthly"),
    year: int = Query(...),
    month: Optional[int] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = []

    if period == "monthly":
        # 12 months of the given year
        for m in range(1, 13):
            _, last_d = calendar.monthrange(year, m)
            start_d = date(year, m, 1)
            end_d = date(year, m, last_d)

            income = db.query(func.sum(models.Transaction.amount)).filter(
                models.Transaction.user_id == current_user.id,
                models.Transaction.type == "income",
                models.Transaction.date >= start_d,
                models.Transaction.date <= end_d,
            ).scalar() or Decimal("0")

            expense = db.query(func.sum(models.Transaction.amount)).filter(
                models.Transaction.user_id == current_user.id,
                models.Transaction.type == "expense",
                models.Transaction.date >= start_d,
                models.Transaction.date <= end_d,
            ).scalar() or Decimal("0")

            result.append(schemas.TrendPoint(
                label=calendar.month_abbr[m],
                income=income,
                expense=expense,
            ))

    elif period == "daily" and month:
        # All days in given month/year
        days_in_month = calendar.monthrange(year, month)[1]
        for d in range(1, days_in_month + 1):
            target_date = date(year, month, d)
            income = db.query(func.sum(models.Transaction.amount)).filter(
                models.Transaction.user_id == current_user.id,
                models.Transaction.type == "income",
                models.Transaction.date == target_date,
            ).scalar() or Decimal("0")

            expense = db.query(func.sum(models.Transaction.amount)).filter(
                models.Transaction.user_id == current_user.id,
                models.Transaction.type == "expense",
                models.Transaction.date == target_date,
            ).scalar() or Decimal("0")

            result.append(schemas.TrendPoint(label=str(d), income=income, expense=expense))

    elif period == "yearly":
        # Last 5 years
        for y in range(year - 4, year + 1):
            start_d = date(y, 1, 1)
            end_d = date(y, 12, 31)

            income = db.query(func.sum(models.Transaction.amount)).filter(
                models.Transaction.user_id == current_user.id,
                models.Transaction.type == "income",
                models.Transaction.date >= start_d,
                models.Transaction.date <= end_d,
            ).scalar() or Decimal("0")

            expense = db.query(func.sum(models.Transaction.amount)).filter(
                models.Transaction.user_id == current_user.id,
                models.Transaction.type == "expense",
                models.Transaction.date >= start_d,
                models.Transaction.date <= end_d,
            ).scalar() or Decimal("0")

            result.append(schemas.TrendPoint(label=str(y), income=income, expense=expense))

    return result


@router.get("/recent-transactions", response_model=List[schemas.TransactionOut])
def get_recent(
    limit: int = Query(5),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(
        models.Transaction.date.desc(), models.Transaction.created_at.desc()
    ).limit(limit).all()
