from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[schemas.TransactionOut])
def list_transactions(
    type: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    if type:
        q = q.filter(models.Transaction.type == type)
    if category_id:
        q = q.filter(models.Transaction.category_id == category_id)
    if start_date:
        q = q.filter(models.Transaction.date >= start_date)
    if end_date:
        q = q.filter(models.Transaction.date <= end_date)
    return q.order_by(models.Transaction.date.desc(), models.Transaction.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=schemas.TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    t_in: schemas.TransactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = models.Transaction(
        user_id=current_user.id,
        type=t_in.type,
        category_id=t_in.category_id,
        amount=t_in.amount,
        description=t_in.description,
        date=t_in.date,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/{t_id}", response_model=schemas.TransactionOut)
def update_transaction(
    t_id: int,
    t_in: schemas.TransactionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(models.Transaction).filter(models.Transaction.id == t_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if t.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if t_in.type is not None:
        t.type = t_in.type
    if t_in.category_id is not None:
        t.category_id = t_in.category_id
    if t_in.amount is not None:
        t.amount = t_in.amount
    if t_in.description is not None:
        t.description = t_in.description
    if t_in.date is not None:
        t.date = t_in.date

    db.commit()
    db.refresh(t)
    return t


@router.delete("/{t_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    t_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(models.Transaction).filter(models.Transaction.id == t_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if t.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(t)
    db.commit()
