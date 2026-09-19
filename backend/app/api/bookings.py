from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.booking import Booking
from app.models.booking_passenger import BookingPassenger
from app.models.booking_seat import BookingSeat
from app.models.bus import Bus
from app.models.payment import Payment
from app.models.seat import Seat
from app.models.user import User


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)


# ============================================================
# REQUEST MODELS
# ============================================================


class PassengerRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    age: int = Field(..., ge=1, le=120)
    gender: str
    seat_number: str


class CreateBookingRequest(BaseModel):
    user_id: int
    bus_id: int
    journey_date: date
    selected_seats: list[str] = Field(..., min_length=1)
    passengers: list[PassengerRequest] = Field(..., min_length=1)
    total_fare: Decimal = Field(..., gt=0)
    payment_method: str
    transaction_id: str | None = None


class CancelBookingRequest(BaseModel):
    reason: str = Field(..., min_length=2)


# ============================================================
# CREATE BOOKING
# ============================================================


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    request: CreateBookingRequest,
    db: Session = Depends(get_db),
):
    try:

        # ----------------------------------------------------
        # 1. CHECK USER
        # ----------------------------------------------------

        user = (
            db.query(User)
            .filter(User.id == request.user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        # ----------------------------------------------------
        # 2. CHECK BUS
        # ----------------------------------------------------

        bus = (
            db.query(Bus)
            .filter(Bus.id == request.bus_id)
            .first()
        )

        if not bus:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bus not found.",
            )

        # ----------------------------------------------------
        # 3. VALIDATE SEATS COUNT
        # ----------------------------------------------------

        if len(request.selected_seats) != len(request.passengers):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Number of selected seats must match "
                    "number of passengers."
                ),
            )

        # ----------------------------------------------------
        # 4. DUPLICATE SEAT CHECK
        # ----------------------------------------------------

        if len(set(request.selected_seats)) != len(
            request.selected_seats
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate seats are not allowed.",
            )

        # ----------------------------------------------------
        # 5. LOCK SELECTED SEATS
        # ----------------------------------------------------

        seats = (
            db.query(Seat)
            .filter(
                Seat.bus_id == request.bus_id,
                Seat.seat_number.in_(
                    request.selected_seats
                ),
            )
            .with_for_update()
            .all()
        )

        # ----------------------------------------------------
        # 6. CHECK ALL SEATS EXIST
        # ----------------------------------------------------

        found_seat_numbers = {
            seat.seat_number
            for seat in seats
        }

        missing_seats = [
            seat
            for seat in request.selected_seats
            if seat not in found_seat_numbers
        ]

        if missing_seats:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid seat(s): "
                    + ", ".join(missing_seats)
                ),
            )

        # ----------------------------------------------------
        # 7. CHECK SEAT AVAILABILITY
        # ----------------------------------------------------

        unavailable_seats = [
            seat.seat_number
            for seat in seats
            if str(seat.status).upper() != "AVAILABLE"
        ]

        if unavailable_seats:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Seat(s) already booked: "
                    + ", ".join(unavailable_seats)
                ),
            )

        # ----------------------------------------------------
        # 8. VERIFY PRICE
        # ----------------------------------------------------

        expected_total = (
            Decimal(str(bus.price))
            * len(request.selected_seats)
        )

        if Decimal(str(request.total_fare)) != expected_total:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid total fare. "
                    f"Expected ₹{expected_total}"
                ),
            )

        # ----------------------------------------------------
        # 9. GENERATE BOOKING ID
        # ----------------------------------------------------

        booking_id = (
            "BG"
            + datetime.now().strftime("%y%m%d")
            + uuid4().hex[:6].upper()
        )

        # ----------------------------------------------------
        # 10. CREATE BOOKING
        # ----------------------------------------------------

        booking = Booking(
            booking_id=booking_id,
            user_id=request.user_id,
            bus_id=request.bus_id,
            journey_date=request.journey_date,
            total_fare=expected_total,
            payment_status="Paid",
            booking_status="Confirmed",
        )

        db.add(booking)
        db.flush()

        # ----------------------------------------------------
        # 11. CREATE BOOKING SEATS
        # ----------------------------------------------------

        for seat in seats:

            booking_seat = BookingSeat(
                booking_id=booking.id,
                seat_id=seat.id,
                seat_number=seat.seat_number,
            )

            db.add(booking_seat)

            # Mark seat as booked
            seat.status = "BOOKED"

        # ----------------------------------------------------
        # 12. CREATE PASSENGERS
        # ----------------------------------------------------

        for passenger in request.passengers:

            booking_passenger = BookingPassenger(
                booking_id=booking.id,
                full_name=passenger.full_name,
                age=passenger.age,
                gender=passenger.gender,
                seat_number=passenger.seat_number,
            )

            db.add(booking_passenger)

        # ----------------------------------------------------
        # 13. CREATE PAYMENT
        # ----------------------------------------------------

        payment = Payment(
            booking_id=booking.id,
            amount=expected_total,
            payment_status="Paid",
            payment_method=request.payment_method,
            transaction_id=(
                request.transaction_id
                or "TXN" + uuid4().hex[:12].upper()
            ),
            paid_at=datetime.utcnow(),
        )

        db.add(payment)

        # ----------------------------------------------------
        # 14. COMMIT EVERYTHING
        # ----------------------------------------------------

        db.commit()

        # ----------------------------------------------------
        # 15. RETURN BOOKING RESULT
        # ----------------------------------------------------

        return {
            "success": True,
            "message": "Booking created successfully.",
            "booking": {
                "id": booking.id,
                "booking_id": booking.booking_id,
                "user_id": booking.user_id,
                "bus_id": booking.bus_id,
                "journey_date": str(
                    booking.journey_date
                ),
                "selected_seats": request.selected_seats,
                "total_fare": float(
                    booking.total_fare
                ),
                "payment_status": (
                    booking.payment_status
                ),
                "booking_status": (
                    booking.booking_status
                ),
                "payment_method": (
                    request.payment_method
                ),
                "transaction_id": (
                    payment.transaction_id
                ),
            },
        }

    # ========================================================
    # ERROR HANDLING FOR CREATE BOOKING
    # ========================================================

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Booking failed: {str(error)}",
        )


# ============================================================
# GET USER BOOKINGS
# ============================================================


@router.get("/user/{user_id}")
def get_user_bookings(
    user_id: int,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # CHECK USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # --------------------------------------------------------
    # GET BOOKINGS
    # --------------------------------------------------------

    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == user_id)
        .order_by(Booking.id.desc())
        .all()
    )

    result = []

    # --------------------------------------------------------
    # BUILD RESPONSE
    # --------------------------------------------------------

    for booking in bookings:

        # ----------------------------------------------------
        # BUS
        # ----------------------------------------------------

        bus = (
            db.query(Bus)
            .filter(Bus.id == booking.bus_id)
            .first()
        )

        # ----------------------------------------------------
        # BOOKING SEATS
        # ----------------------------------------------------

        booking_seats = (
            db.query(BookingSeat)
            .filter(
                BookingSeat.booking_id == booking.id
            )
            .all()
        )

        # ----------------------------------------------------
        # PASSENGERS
        # ----------------------------------------------------

        passengers = (
            db.query(BookingPassenger)
            .filter(
                BookingPassenger.booking_id == booking.id
            )
            .all()
        )

        # ----------------------------------------------------
        # PAYMENT
        # ----------------------------------------------------

        payment = (
            db.query(Payment)
            .filter(
                Payment.booking_id == booking.id
            )
            .first()
        )

        # ----------------------------------------------------
        # APPEND BOOKING
        # ----------------------------------------------------

        result.append(
            {
                "id": booking.id,

                "booking_id": booking.booking_id,

                "user_id": booking.user_id,

                "bus_id": booking.bus_id,

                "journey_date": str(
                    booking.journey_date
                ),

                "total_fare": float(
                    booking.total_fare
                ),

                "payment_status": (
                    booking.payment_status
                ),

                "booking_status": (
                    booking.booking_status
                ),

                "selected_seats": [
                    seat.seat_number
                    for seat in booking_seats
                ],

                "passengers": [
                    {
                        "full_name": passenger.full_name,
                        "age": passenger.age,
                        "gender": passenger.gender,
                        "seat_number": passenger.seat_number,
                    }
                    for passenger in passengers
                ],

                "payment": (
                    {
                        "payment_method": (
                            payment.payment_method
                        ),
                        "transaction_id": (
                            payment.transaction_id
                        ),
                        "payment_status": (
                            payment.payment_status
                        ),
                    }
                    if payment
                    else None
                ),

                "bus": (
                    {
                        "id": bus.id,
                        "operator": bus.operator,
                        "from": bus.from_city,
                        "to": bus.to_city,
                        "departure": bus.departure_time,
                        "arrival": bus.arrival_time,
                        "duration": bus.duration,
                        "type": bus.bus_type,
                        "price": float(bus.price),
                    }
                    if bus
                    else None
                ),
            }
        )

    # --------------------------------------------------------
    # RETURN
    # --------------------------------------------------------

    return {
        "success": True,
        "count": len(result),
        "bookings": result,
    }


# ============================================================
# CANCEL BOOKING
# ============================================================


@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: str,
    request: CancelBookingRequest,
    db: Session = Depends(get_db),
):

    try:

        # ----------------------------------------------------
        # 1. FIND BOOKING
        # ----------------------------------------------------

        booking = (
            db.query(Booking)
            .filter(
                Booking.booking_id == booking_id
            )
            .with_for_update()
            .first()
        )

        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found.",
            )

        # ----------------------------------------------------
        # 2. CHECK BOOKING STATUS
        # ----------------------------------------------------

        if booking.booking_status == "Cancelled":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Booking is already cancelled.",
            )

        if booking.booking_status != "Confirmed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Booking cannot be cancelled "
                    f"because its status is "
                    f"{booking.booking_status}."
                ),
            )

        # ----------------------------------------------------
        # 3. GET BOOKED SEATS
        # ----------------------------------------------------

        booking_seats = (
            db.query(BookingSeat)
            .filter(
                BookingSeat.booking_id == booking.id
            )
            .all()
        )

        # ----------------------------------------------------
        # 4. LOCK AND RELEASE SEATS
        # ----------------------------------------------------

        released_seats = []

        for booking_seat in booking_seats:

            seat = (
                db.query(Seat)
                .filter(
                    Seat.id == booking_seat.seat_id
                )
                .with_for_update()
                .first()
            )

            if seat:

                seat.status = "AVAILABLE"

                released_seats.append(
                    seat.seat_number
                )

        # ----------------------------------------------------
        # 5. CALCULATE REFUND
        # ----------------------------------------------------

        total_fare = Decimal(
            str(booking.total_fare)
        )

        cancellation_charge = (
            total_fare * Decimal("0.10")
        ).quantize(
            Decimal("0.01")
        )

        refund_amount = (
            total_fare - cancellation_charge
        ).quantize(
            Decimal("0.01")
        )

        # ----------------------------------------------------
        # 6. UPDATE BOOKING
        # ----------------------------------------------------

        booking.booking_status = "Cancelled"

        # Keep payment status as refund processing
        booking.payment_status = (
            "Refund Processing"
        )

        # ----------------------------------------------------
        # 7. UPDATE PAYMENT
        # ----------------------------------------------------

        payment = (
            db.query(Payment)
            .filter(
                Payment.booking_id == booking.id
            )
            .first()
        )

        if payment:
            payment.payment_status = (
                "Refund Processing"
            )

        # ----------------------------------------------------
        # 8. COMMIT
        # ----------------------------------------------------

        db.commit()

        # ----------------------------------------------------
        # 9. RETURN CANCELLATION RESULT
        # ----------------------------------------------------

        return {
            "success": True,
            "message": (
                "Booking cancelled successfully."
            ),
            "cancellation": {
                "booking_id": booking.booking_id,
                "booking_status": (
                    booking.booking_status
                ),
                "payment_status": (
                    booking.payment_status
                ),
                "reason": request.reason,
                "total_fare": float(
                    total_fare
                ),
                "cancellation_charge": float(
                    cancellation_charge
                ),
                "refund_amount": float(
                    refund_amount
                ),
                "refund_status": (
                    "Processing"
                ),
                "released_seats": released_seats,
                "cancelled_at": (
                    datetime.utcnow().isoformat()
                ),
            },
        }

    # ========================================================
    # ERROR HANDLING
    # ========================================================

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"Cancellation failed: {str(error)}"
            ),
        )