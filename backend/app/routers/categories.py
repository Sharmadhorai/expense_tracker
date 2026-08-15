from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[schemas.CategoryOut])
def list_categories(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Return system defaults + user's own categories
    cats = db.query(models.Category).filter(
        (models.Category.user_id == None) | (models.Category.user_id == current_user.id)
    ).all()
    return cats


@router.post("", response_model=schemas.CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = models.Category(
        user_id=current_user.id,
        name=cat_in.name,
        icon=cat_in.icon,
        color=cat_in.color,
        is_default=False,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{cat_id}", response_model=schemas.CategoryOut)
def update_category(
    cat_id: int,
    cat_in: schemas.CategoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if cat.is_default or cat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot modify this category")

    if cat_in.name is not None:
        cat.name = cat_in.name
    if cat_in.icon is not None:
        cat.icon = cat_in.icon
    if cat_in.color is not None:
        cat.color = cat_in.color
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    cat_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if cat.is_default or cat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete this category")
    db.delete(cat)
    db.commit()
