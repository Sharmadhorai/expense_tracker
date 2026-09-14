from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from decimal import Decimal
from datetime import date
import calendar

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=List[schemas.BudgetOut])
def list_budgets(
    month: int = Query(...),
    year: int = Query(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.month == month,
        models.Budget.year == year,
    ).all()

    _, last_day = calendar.monthrange(year, month)
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)

    result = []
    for b in budgets:
        # Calculate spent amount for this budget using database-agnostic date range
        q = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.type == "expense",
            models.Transaction.date >= start_date,
            models.Transaction.date <= end_date,
        )
        if b.category_id:
            q = q.filter(models.Transaction.category_id == b.category_id)

        spent = q.scalar() or Decimal("0")
        remaining = Decimal(str(b.amount)) - Decimal(str(spent))

        budget_out = schemas.BudgetOut(
            id=b.id,
            user_id=b.user_id,
            category_id=b.category_id,
            amount=b.amount,
            month=b.month,
            year=b.year,
            category=b.category,
            spent=spent,
            remaining=remaining,
        )
        result.append(budget_out)
    return result


@router.post("", response_model=schemas.BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(
    b_in: schemas.BudgetCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Upsert: If budget for same period and category exists, update it cleanly
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.month == b_in.month,
        models.Budget.year == b_in.year,
        models.Budget.category_id == b_in.category_id,
    ).first()

    if existing:
        existing.amount = b_in.amount
        db.commit()
        db.refresh(existing)
        b = existing
    else:
        b = models.Budget(
            user_id=current_user.id,
            category_id=b_in.category_id,
            amount=b_in.amount,
            month=b_in.month,
            year=b_in.year,
        )
        db.add(b)
        db.commit()
        db.refresh(b)

    _, last_day = calendar.monthrange(b.year, b.month)
    start_date = date(b.year, b.month, 1)
    end_date = date(b.year, b.month, last_day)

    q = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == "expense",
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date,
    )
    if b.category_id:
        q = q.filter(models.Transaction.category_id == b.category_id)

    spent = q.scalar() or Decimal("0")
    remaining = Decimal(str(b.amount)) - Decimal(str(spent))

    return schemas.BudgetOut(
        id=b.id, user_id=b.user_id, category_id=b.category_id,
        amount=b.amount, month=b.month, year=b.year,
        category=b.category, spent=spent, remaining=remaining
    )


@router.put("/{b_id}", response_model=schemas.BudgetOut)
def update_budget(
    b_id: int,
    b_in: schemas.BudgetUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(models.Budget).filter(models.Budget.id == b_id).first()
    if not b or b.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Budget not found")
    if b_in.amount is not None:
        b.amount = b_in.amount
    db.commit()
    db.refresh(b)
    return schemas.BudgetOut(
        id=b.id, user_id=b.user_id, category_id=b.category_id,
        amount=b.amount, month=b.month, year=b.year,
        category=b.category, spent=Decimal("0"), remaining=b.amount
    )


@router.delete("/{b_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    b_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(models.Budget).filter(models.Budget.id == b_id).first()
    if not b or b.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b)
    db.commit()
