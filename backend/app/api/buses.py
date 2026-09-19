from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.bus import Bus


router = APIRouter(
    prefix="/api/buses",
    tags=["Buses"],
)


def bus_to_response(bus: Bus):
    available_seats = sum(
        1
        for seat in bus.seats
        if seat.status == "available"
    )

    return {
        "id": bus.id,
        "operator": bus.operator,
        "rating": bus.rating,
        "from": bus.from_city,
        "to": bus.to_city,
        "departureTime": bus.departure_time.strftime("%H:%M"),
        "arrivalTime": bus.arrival_time.strftime("%H:%M"),
        "duration": bus.duration,
        "busType": bus.bus_type,
        "price": bus.price,
        "availableSeats": available_seats,
    }


# ============================================================
# GET ALL BUSES
# ============================================================

@router.get("")
def get_buses(db: Session = Depends(get_db)):
    buses = (
        db.query(Bus)
        .order_by(Bus.id)
        .all()
    )

    return [bus_to_response(bus) for bus in buses]


# ============================================================
# GET BUS BY ID
# ============================================================

@router.get("/{bus_id}")
def get_bus(
    bus_id: int,
    db: Session = Depends(get_db),
):
    bus = (
        db.query(Bus)
        .filter(Bus.id == bus_id)
        .first()
    )

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found",
        )

    return bus_to_response(bus)