from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, SessionLocal, Base
from . import models
from .routers import auth, transactions, categories, budgets, reports

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ExpenseTrack API",
    description="Personal finance tracking API",
    version="1.0.0",
)

# CORS – allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(reports.router)


DEFAULT_CATEGORIES = [
    {"name": "Food",          "icon": "🍕", "color": "#FF6B6B"},
    {"name": "Transport",     "icon": "🚗", "color": "#4ECDC4"},
    {"name": "Shopping",      "icon": "🛍️", "color": "#45B7D1"},
    {"name": "Bills",         "icon": "📄", "color": "#96CEB4"},
    {"name": "Entertainment", "icon": "🎬", "color": "#FFEAA7"},
    {"name": "Health",        "icon": "💊", "color": "#DDA0DD"},
    {"name": "Education",     "icon": "📚", "color": "#98D8C8"},
    {"name": "Other",         "icon": "📦", "color": "#B0B0B0"},
    {"name": "Salary",        "icon": "💼", "color": "#6C63FF"},
    {"name": "Freelance",     "icon": "💻", "color": "#03DAC6"},
    {"name": "Investment",    "icon": "📈", "color": "#FF9F43"},
]


@app.on_event("startup")
def seed_default_categories():
    db: Session = SessionLocal()
    try:
        existing = db.query(models.Category).filter(models.Category.is_default == True).count()
        if existing == 0:
            for cat in DEFAULT_CATEGORIES:
                db.add(models.Category(
                    user_id=None,
                    name=cat["name"],
                    icon=cat["icon"],
                    color=cat["color"],
                    is_default=True,
                ))
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "ExpenseTrack API is running 🚀", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
