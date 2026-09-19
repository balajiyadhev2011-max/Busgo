from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.bus import Bus
from app.models.seat import Seat


router = APIRouter(
    prefix="/api/buses",
    tags=["Seats"],
)


# ============================================================
# GET ALL SEATS FOR A BUS
# ============================================================

@router.get("/{bus_id}/seats")
def get_bus_seats(
    bus_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check whether bus exists
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Get seats for the selected bus
    # --------------------------------------------------------

    seats = (
        db.query(Seat)
        .filter(Seat.bus_id == bus_id)
        .order_by(Seat.id)
        .all()
    )

    # --------------------------------------------------------
    # Return seat information
    # --------------------------------------------------------

    return [
        {
            "id": seat.id,
            "busId": seat.bus_id,
            "seatNumber": seat.seat_number,
            "seatType": seat.seat_type,
            "status": seat.status,
        }
        for seat in seats
    ]