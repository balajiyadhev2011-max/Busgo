from datetime import datetime, date

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    booking_id: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        index=True,
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    bus_id: Mapped[int] = mapped_column(
        ForeignKey("buses.id"),
        nullable=False,
    )

    journey_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    total_fare: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    payment_status: Mapped[str] = mapped_column(
        String(30),
        default="Pending",
        nullable=False,
    )

    booking_status: Mapped[str] = mapped_column(
        String(30),
        default="Confirmed",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="bookings",
    )

    bus = relationship(
        "Bus",
        back_populates="bookings",
    )

    passengers = relationship(
        "BookingPassenger",
        back_populates="booking",
        cascade="all, delete-orphan",
    )

    booking_seats = relationship(
        "BookingSeat",
        back_populates="booking",
        cascade="all, delete-orphan",
    )

    payment = relationship(
        "Payment",
        back_populates="booking",
        uselist=False,
        cascade="all, delete-orphan",
    )

    cancellation = relationship(
        "Cancellation",
        back_populates="booking",
        uselist=False,
        cascade="all, delete-orphan",
    )