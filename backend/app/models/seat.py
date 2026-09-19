from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Seat(Base):
    __tablename__ = "seats"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    bus_id: Mapped[int] = mapped_column(
        ForeignKey("buses.id"),
        nullable=False,
    )

    seat_number: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    seat_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="available",
        nullable=False,
    )

    bus = relationship(
        "Bus",
        back_populates="seats",
    )

    booking_seats = relationship(
        "BookingSeat",
        back_populates="seat",
    )