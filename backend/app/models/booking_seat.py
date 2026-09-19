from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class BookingSeat(Base):
    __tablename__ = "booking_seats"

    id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=False,
    )

    seat_id = Column(
        Integer,
        ForeignKey("seats.id"),
        nullable=False,
    )

    seat_number = Column(
        String,
        nullable=False,
    )

    booking = relationship(
        "Booking",
        back_populates="booking_seats",
    )

    seat = relationship(
        "Seat",
        back_populates="booking_seats",
    )