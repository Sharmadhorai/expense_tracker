from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
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


@app.get("/")
def root():
    return {"message": "ExpenseTrack API is running 🚀", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
