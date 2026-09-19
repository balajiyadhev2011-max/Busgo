from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class BookingPassenger(Base):
    __tablename__ = "booking_passengers"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=False,
    )

    full_name = Column(
        String(100),
        nullable=False,
    )

    age = Column(
        Integer,
        nullable=False,
    )

    gender = Column(
        String(20),
        nullable=False,
    )

    seat_number = Column(
        String(10),
        nullable=False,
    )

    booking = relationship(
        "Booking",
        back_populates="passengers",
    )