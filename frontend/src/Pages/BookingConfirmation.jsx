import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "../App.css";

function BookingConfirmation() {
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState(null);

  useEffect(() => {
    const storedBooking = JSON.parse(
      localStorage.getItem("busgoBooking") || "null"
    );

    const storedPassengers = JSON.parse(
      localStorage.getItem("busgoPassengerDetails") || "null"
    );

    if (!storedBooking) {
      navigate("/");
      return;
    }

    // Generate booking ID if Payment has not created one yet.
    let bookingId = storedBooking.bookingId;

    if (!bookingId) {
      bookingId = "BG" + Date.now().toString().slice(-10);

      const updatedBooking = {
        ...storedBooking,
        bookingId,
        paymentStatus: "Paid",
        bookingStatus: "Confirmed",
      };

      localStorage.setItem(
        "busgoBooking",
        JSON.stringify(updatedBooking)
      );

      setBooking(updatedBooking);
    } else {
      setBooking(storedBooking);
    }

    setPassengerDetails(storedPassengers);
  }, [navigate]);

  if (!booking) {
    return null;
  }

  const buses = {
    1: {
      operator: "GreenLine Travels",
      from: "Chennai",
      to: "Bengaluru",
      departure: "10:30 PM",
      arrival: "05:30 AM",
      duration: "7h 00m",
      type: "AC Sleeper",
      price: 899,
    },

    2: {
      operator: "South Express",
      from: "Chennai",
      to: "Bengaluru",
      departure: "09:45 PM",
      arrival: "05:15 AM",
      duration: "7h 30m",
      type: "AC Semi Sleeper",
      price: 699,
    },

    3: {
      operator: "Royal Roadways",
      from: "Chennai",
      to: "Bengaluru",
      departure: "11:15 PM",
      arrival: "06:00 AM",
      duration: "6h 45m",
      type: "AC Sleeper",
      price: 999,
    },

    4: {
      operator: "CityRide",
      from: "Chennai",
      to: "Bengaluru",
      departure: "08:30 PM",
      arrival: "04:30 AM",
      duration: "8h 00m",
      type: "Non AC Sleeper",
      price: 549,
    },
  };

  const bus = buses[booking.busId] || buses[1];

  const selectedSeats = booking.selectedSeats || [];

  const totalFare =
    booking.totalFare ||
    selectedSeats.length * bus.price;

  const passengers =
    passengerDetails?.passengers || [];

  /*
   * QR CODE DATA
   *
   * This information is encoded into the QR code.
   * When scanned, the ticket information can be read.
   */
  const qrData = JSON.stringify({
    platform: "BusGo",
    bookingId: booking.bookingId,
    passenger:
      passengers.length > 0
        ? passengers[0].fullName
        : "Passenger",
    route: `${bus.from} → ${bus.to}`,
    date: "18 Sep 2026",
    departure: bus.departure,
    arrival: bus.arrival,
    bus: bus.operator,
    seats: selectedSeats.join(", "),
    amount: `₹${totalFare}`,
    paymentStatus: booking.paymentStatus || "Paid",
    bookingStatus: booking.bookingStatus || "Confirmed",
  });

  return (
    <div className="confirmation-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="confirmation-header">

        <div
          className="confirmation-logo"
          onClick={() => navigate("/")}
        >
          <span className="confirmation-logo-icon">
            B
          </span>

          <span>BusGo</span>
        </div>

        <div className="confirmation-progress">

          <span className="completed">
            ✓ Search
          </span>

          <span className="completed">
            ✓ Seat
          </span>

          <span className="completed">
            ✓ Passenger
          </span>

          <span className="completed">
            ✓ Payment
          </span>

          <span className="active">
            5 Confirmation
          </span>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="confirmation-container">

        {/* ===================================================
            SUCCESS
        =================================================== */}

        <section className="confirmation-success">

          <div className="confirmation-check">
            ✓
          </div>

          <span className="confirmation-label">
            BOOKING CONFIRMED
          </span>

          <h1>
            Your journey is booked!
          </h1>

          <p>
            Your bus ticket has been confirmed successfully.
            Keep your booking ID handy for future reference.
          </p>

        </section>


        {/* ===================================================
            BOOKING ID
        =================================================== */}

        <section className="booking-id-card">

          <div>

            <span>
              BOOKING ID
            </span>

            <strong>
              {booking.bookingId}
            </strong>

          </div>

          <div className="payment-status">

            <span>
              PAYMENT
            </span>

            <strong>
              ✓ Paid
            </strong>

          </div>

        </section>


        {/* ===================================================
            DIGITAL TICKET
        =================================================== */}

        <section className="confirmation-ticket">

          {/* TICKET HEADER */}

          <div className="ticket-header">

            <div>

              <span className="ticket-label">
                BUSGO DIGITAL TICKET
              </span>

              <h2>
                {bus.from} → {bus.to}
              </h2>

              <p>
                18 Sep 2026
              </p>

            </div>

            <div className="ticket-status">
              CONFIRMED
            </div>

          </div>


          {/* =================================================
              JOURNEY
          ================================================= */}

          <div className="ticket-journey">

            <div className="journey-point">

              <span>
                DEPARTURE
              </span>

              <strong>
                {bus.departure}
              </strong>

              <small>
                {bus.from}
              </small>

            </div>


            <div className="journey-line">

              <span>
                {bus.duration}
              </span>

              <div></div>

            </div>


            <div className="journey-point arrival">

              <span>
                ARRIVAL
              </span>

              <strong>
                {bus.arrival}
              </strong>

              <small>
                {bus.to}
              </small>

            </div>

          </div>


          {/* =================================================
              BUS DETAILS
          ================================================= */}

          <div className="ticket-details">

            <div>

              <span>
                BUS
              </span>

              <strong>
                {bus.operator}
              </strong>

            </div>

            <div>

              <span>
                BUS TYPE
              </span>

              <strong>
                {bus.type}
              </strong>

            </div>

            <div>

              <span>
                SEATS
              </span>

              <strong>
                {selectedSeats.length > 0
                  ? selectedSeats.join(", ")
                  : "N/A"}
              </strong>

            </div>

          </div>


          {/* =================================================
              QR CODE
          ================================================= */}

          <div className="ticket-qr-section">

            <div className="ticket-qr-content">

              <div>

                <span className="ticket-label">
                  DIGITAL BOARDING PASS
                </span>

                <h3>
                  Scan to verify ticket
                </h3>

                <p>
                  Present this QR code while boarding.
                </p>

              </div>

              <div className="ticket-qr-code">

                <QRCodeSVG
                  value={qrData}
                  size={170}
                  level="M"
                  includeMargin={true}
                />

              </div>

            </div>

            <div className="ticket-qr-booking">

              <span>
                BOOKING ID
              </span>

              <strong>
                {booking.bookingId}
              </strong>

            </div>

          </div>


          {/* =================================================
              PASSENGERS
          ================================================= */}

          <div className="ticket-passengers">

            <h3>
              Passenger Details
            </h3>

            {passengers.length > 0 ? (

              passengers.map(
                (passenger, index) => (

                  <div
                    className="ticket-passenger"
                    key={passenger.seat || index}
                  >

                    <div>

                      <span>
                        Passenger {index + 1}
                      </span>

                      <strong>
                        {passenger.fullName}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Age
                      </span>

                      <strong>
                        {passenger.age}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Gender
                      </span>

                      <strong>
                        {passenger.gender}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Seat
                      </span>

                      <strong>
                        {passenger.seat}
                      </strong>

                    </div>

                  </div>

                )
              )

            ) : (

              <p>
                Passenger details unavailable.
              </p>

            )}

          </div>


          {/* =================================================
              FARE
          ================================================= */}

          <div className="ticket-fare">

            <span>
              Total Paid
            </span>

            <strong>
              ₹{totalFare}
            </strong>

          </div>

        </section>


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <section className="confirmation-actions">

          <button
            className="primary-confirmation-btn"
            onClick={() => navigate("/my-bookings")}
          >
            View My Bookings →
          </button>

          <button
            className="secondary-confirmation-btn"
            onClick={() => window.print()}
          >
            Print Ticket
          </button>

        </section>


        {/* ===================================================
            NOTE
        =================================================== */}

        <div className="confirmation-note">

          <span>
            ✉
          </span>

          <p>
            Your booking details have been saved.
            Please keep your Booking ID
            <strong>
              {" "}
              {booking.bookingId}
            </strong>
            {" "}
            for future reference.
          </p>

        </div>

      </main>

    </div>
  );
}

export default BookingConfirmation;