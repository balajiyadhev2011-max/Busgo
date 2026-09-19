import os

from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from app.api.buses import router as buses_router
from app.api.seats import router as seats_router
from app.api.users import router as users_router
from app.api import bookings

from app.db.database import Base, engine

# Import all models so SQLAlchemy knows about them
from app import models


# ============================================================
# DATABASE TABLE CREATION
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="BusGo API",
    description="Professional Bus Ticket Booking Platform",
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        (
            "http://localhost:5173,"
            "http://127.0.0.1:5173,"
            "http://localhost:5174,"
            "http://127.0.0.1:5174"
        ),
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(buses_router)
app.include_router(seats_router)
app.include_router(users_router)
app.include_router(bookings.router)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "success",
        "application": "BusGo",
        "version": "1.0.0",
    }


# ============================================================
# DATABASE HEALTH CHECK
# ============================================================

@app.get("/health/db")
def database_health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "success",
        "database": "PostgreSQL",
        "database_name": "busgo_db",
    }