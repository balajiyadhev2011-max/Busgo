from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Cancellation(Base):
    __tablename__ = "cancellations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id"),
        unique=True,
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    cancellation_charge: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    refund_amount: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    refund_status: Mapped[str] = mapped_column(
        String(30),
        default="Processing",
        nullable=False,
    )

    cancelled_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    booking = relationship(
        "Booking",
        back_populates="cancellation",
    )