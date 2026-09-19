from datetime import time

from app.db.database import SessionLocal
from app.models.bus import Bus
from app.models.seat import Seat


BUSES = [
    {
        "id": 1,
        "operator": "GreenLine Travels",
        "rating": 4.6,
        "from_city": "Chennai",
        "to_city": "Bengaluru",
        "departure_time": time(22, 30),
        "arrival_time": time(5, 30),
        "duration": "7h 00m",
        "bus_type": "AC Sleeper",
        "price": 899,
    },
    {
        "id": 2,
        "operator": "South Express",
        "rating": 4.4,
        "from_city": "Chennai",
        "to_city": "Bengaluru",
        "departure_time": time(21, 45),
        "arrival_time": time(5, 15),
        "duration": "7h 30m",
        "bus_type": "AC Semi Sleeper",
        "price": 699,
    },
    {
        "id": 3,
        "operator": "Royal Roadways",
        "rating": 4.7,
        "from_city": "Chennai",
        "to_city": "Bengaluru",
        "departure_time": time(23, 15),
        "arrival_time": time(6, 0),
        "duration": "6h 45m",
        "bus_type": "AC Sleeper",
        "price": 999,
    },
    {
        "id": 4,
        "operator": "CityRide",
        "rating": 4.3,
        "from_city": "Chennai",
        "to_city": "Bengaluru",
        "departure_time": time(20, 30),
        "arrival_time": time(4, 30),
        "duration": "8h 00m",
        "bus_type": "Non AC Sleeper",
        "price": 549,
    },
]


BOOKED_SEATS = {
    1: {"U3", "U6", "U10", "L2", "L6", "L11"},
    2: {"U3", "U6", "U10", "L2", "L6", "L11"},
    3: {"U3", "U6", "U10", "L2", "L6", "L11"},
    4: {"U3", "U6", "U10", "L2", "L6", "L11"},
}


def seed_buses():
    db = SessionLocal()

    try:
        existing_buses = db.query(Bus).count()

        if existing_buses > 0:
            print(f"Buses already exist: {existing_buses}")
            return

        for bus_data in BUSES:
            bus = Bus(**bus_data)
            db.add(bus)

        db.commit()

        print(f"Inserted {len(BUSES)} buses.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def seed_seats():
    db = SessionLocal()

    try:
        existing_seats = db.query(Seat).count()

        if existing_seats > 0:
            print(f"Seats already exist: {existing_seats}")
            return

        total_seats = 0

        for bus_id in range(1, 5):

            for number in range(1, 13):
                seat_number = f"U{number}"

                seat = Seat(
                    bus_id=bus_id,
                    seat_number=seat_number,
                    seat_type="upper",
                    status=(
                        "booked"
                        if seat_number in BOOKED_SEATS[bus_id]
                        else "available"
                    ),
                )

                db.add(seat)
                total_seats += 1

            for number in range(1, 13):
                seat_number = f"L{number}"

                seat = Seat(
                    bus_id=bus_id,
                    seat_number=seat_number,
                    seat_type="lower",
                    status=(
                        "booked"
                        if seat_number in BOOKED_SEATS[bus_id]
                        else "available"
                    ),
                )

                db.add(seat)
                total_seats += 1

        db.commit()

        print(f"Inserted {total_seats} seats.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    print("Starting BusGo database seed...")

    seed_buses()
    seed_seats()

    print("BusGo database seed completed.")