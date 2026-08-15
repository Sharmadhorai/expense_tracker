from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from enum import Enum


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


# ─────────────────────────── User Schemas ────────────────────────────

class UserBase(BaseModel):
    name: str
    email: EmailStr
    currency: Optional[str] = "USD"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    currency: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class UserOut(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─────────────────────────── Category Schemas ────────────────────────

class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = "📦"
    color: Optional[str] = "#B0B0B0"


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryOut(CategoryBase):
    id: int
    user_id: Optional[int] = None
    is_default: bool

    model_config = {"from_attributes": True}


# ─────────────────────────── Transaction Schemas ─────────────────────

class TransactionBase(BaseModel):
    type: TransactionType
    category_id: Optional[int] = None
    amount: Decimal
    description: Optional[str] = None
    date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    date: Optional[date] = None


class TransactionOut(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    category: Optional[CategoryOut] = None

    model_config = {"from_attributes": True}


# ─────────────────────────── Budget Schemas ──────────────────────────

class BudgetBase(BaseModel):
    category_id: Optional[int] = None
    amount: Decimal
    month: int
    year: int


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    amount: Optional[Decimal] = None


class BudgetOut(BudgetBase):
    id: int
    user_id: int
    category: Optional[CategoryOut] = None
    spent: Optional[Decimal] = None
    remaining: Optional[Decimal] = None

    model_config = {"from_attributes": True}


# ─────────────────────────── Report Schemas ──────────────────────────

class ReportSummary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net: Decimal
    transaction_count: int


class CategoryBreakdown(BaseModel):
    category_id: Optional[int]
    category_name: str
    category_icon: str
    category_color: str
    total: Decimal
    percentage: float


class TrendPoint(BaseModel):
    label: str
    income: Decimal
    expense: Decimal
