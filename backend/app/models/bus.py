from datetime import time

from sqlalchemy import Float, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Bus(Base):
    __tablename__ = "buses"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    operator: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    rating: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    from_city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    to_city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    departure_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    arrival_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    duration: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    bus_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    price: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    seats = relationship(
        "Seat",
        back_populates="bus",
        cascade="all, delete-orphan",
    )

    bookings = relationship(
        "Booking",
        back_populates="bus",
    )