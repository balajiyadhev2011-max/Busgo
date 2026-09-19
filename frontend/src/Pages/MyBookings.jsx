import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MyBookings() {
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH USER BOOKINGS FROM BACKEND
  // =====================================================

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const currentUser = JSON.parse(
          localStorage.getItem("busgoCurrentUser") || "null"
        );

        if (!currentUser?.id) {
          setBooking(null);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/bookings/user/${currentUser.id}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch bookings");
        }

        const data = await response.json();

        if (
          data.success &&
          Array.isArray(data.bookings) &&
          data.bookings.length > 0
        ) {
          // Backend returns newest booking first
          const latestBooking = data.bookings[0];

          // Normalize backend status
          const normalizedBookingStatus = String(
            latestBooking.booking_status || "Confirmed"
          ).trim();

          const normalizedPaymentStatus = String(
            latestBooking.payment_status || "Pending"
          ).trim();

          setBooking({
            ...latestBooking,

            bookingId: latestBooking.booking_id,

            bookingStatus: normalizedBookingStatus,

            paymentStatus: normalizedPaymentStatus,

            selectedSeats: latestBooking.selected_seats || [],

            totalFare: latestBooking.total_fare,

            pricePerSeat:
              latestBooking.bus?.price ||
              latestBooking.total_fare /
                Math.max(
                  latestBooking.selected_seats?.length || 1,
                  1
                ),

            journeyDate: latestBooking.journey_date,

            bus: latestBooking.bus
              ? {
                  operator: latestBooking.bus.operator,
                  from: latestBooking.bus.from,
                  to: latestBooking.bus.to,
                  departure: latestBooking.bus.departure,
                  arrival: latestBooking.bus.arrival,
                  duration: latestBooking.bus.duration,
                  type: latestBooking.bus.type,
                  price: latestBooking.bus.price,
                }
              : null,

            passengers: latestBooking.passengers || [],

            payment: latestBooking.payment || null,
          });
        } else {
          setBooking(null);
        }
      } catch (err) {
        console.error("My Bookings error:", err);

        setError(
          "Unable to load your bookings. Please try again."
        );

        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // =====================================================
  // STATUS HELPERS
  // =====================================================

  const isCancelled =
    String(booking?.bookingStatus || "")
      .trim()
      .toLowerCase() === "cancelled";

  // =====================================================
  // VIEW TICKET
  // =====================================================

  const handleViewTicket = () => {
    navigate("/booking-confirmation");
  };

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const handleCancelBooking = () => {
    if (!booking?.bookingId) {
      return;
    }

    navigate(
      `/cancellation?bookingId=${encodeURIComponent(
        booking.bookingId
      )}`
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="my-bookings-page">

        <header className="my-bookings-header">

          <div
            className="my-bookings-logo"
            onClick={() => navigate("/")}
          >
            <span className="logo-icon">
              B
            </span>

            <span>
              BusGo
            </span>
          </div>

          <nav className="my-bookings-nav">

            <button onClick={() => navigate("/")}>
              Home
            </button>

            <button className="active">
              My Bookings
            </button>

            <button>
              Track Bus
            </button>

            <button>
              Help
            </button>

          </nav>

          <button
            className="my-bookings-login"
            onClick={() => navigate("/login")}
          >
            Account
          </button>

        </header>

        <main className="my-bookings-container">

          <div className="my-bookings-title">

            <span className="section-label">
              MY BOOKINGS
            </span>

            <h1>
              Your journeys
            </h1>

            <p>
              View and manage your BusGo bookings.
            </p>

          </div>

          <div className="no-booking-card">

            <div className="no-booking-icon">
              🚌
            </div>

            <h2>
              Loading bookings...
            </h2>

            <p>
              Please wait while we load your bookings.
            </p>

          </div>

        </main>

        <footer className="my-bookings-footer">

          <strong>
            BusGo
          </strong>

          <span>
            Safe journeys. Simple bookings.
          </span>

        </footer>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="my-bookings-page">

        <header className="my-bookings-header">

          <div
            className="my-bookings-logo"
            onClick={() => navigate("/")}
          >
            <span className="logo-icon">
              B
            </span>

            <span>
              BusGo
            </span>
          </div>

          <nav className="my-bookings-nav">

            <button onClick={() => navigate("/")}>
              Home
            </button>

            <button className="active">
              My Bookings
            </button>

            <button>
              Track Bus
            </button>

            <button>
              Help
            </button>

          </nav>

          <button
            className="my-bookings-login"
            onClick={() => navigate("/login")}
          >
            Account
          </button>

        </header>

        <main className="my-bookings-container">

          <div className="my-bookings-title">

            <span className="section-label">
              MY BOOKINGS
            </span>

            <h1>
              Your journeys
            </h1>

            <p>
              View and manage your BusGo bookings.
            </p>

          </div>

          <div className="no-booking-card">

            <div className="no-booking-icon">
              ⚠️
            </div>

            <h2>
              Unable to load bookings
            </h2>

            <p>
              {error}
            </p>

            <button
              className="primary-booking-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
              <span>
                →
              </span>
            </button>

          </div>

        </main>

        <footer className="my-bookings-footer">

          <strong>
            BusGo
          </strong>

          <span>
            Safe journeys. Simple bookings.
          </span>

        </footer>

      </div>
    );
  }

  // =====================================================
  // BUS DATA
  // =====================================================

  const bus = booking?.bus;

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="my-bookings-page">

      {/* HEADER */}

      <header className="my-bookings-header">

        <div
          className="my-bookings-logo"
          onClick={() => navigate("/")}
        >
          <span className="logo-icon">
            B
          </span>

          <span>
            BusGo
          </span>
        </div>

        <nav className="my-bookings-nav">

          <button
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button className="active">
            My Bookings
          </button>

          <button>
            Track Bus
          </button>

          <button>
            Help
          </button>

        </nav>

        <button
          className="my-bookings-login"
          onClick={() => navigate("/login")}
        >
          Account
        </button>

      </header>

      {/* MAIN */}

      <main className="my-bookings-container">

        <div className="my-bookings-title">

          <span className="section-label">
            MY BOOKINGS
          </span>

          <h1>
            Your journeys
          </h1>

          <p>
            View and manage your BusGo bookings.
          </p>

        </div>

        {!booking ? (

          /* =================================================
             NO BOOKING
             ================================================= */

          <div className="no-booking-card">

            <div className="no-booking-icon">
              🚌
            </div>

            <h2>
              No bookings yet
            </h2>

            <p>
              You haven't made any bus bookings yet.
              Start planning your next journey with BusGo.
            </p>

            <button
              className="primary-booking-btn"
              onClick={() => navigate("/")}
            >
              Search Buses
              <span>
                →
              </span>
            </button>

          </div>

        ) : (

          /* =================================================
             BOOKING CARD
             ================================================= */

          <div className="booking-card">

            {/* CARD HEADER */}

            <div className="booking-card-header">

              <div>

                <span className="booking-card-label">
                  BUSGO BOOKING
                </span>

                <h2>
                  {bus?.from || "Chennai"}
                  {" → "}
                  {bus?.to || "Bengaluru"}
                </h2>

                <p>
                  {booking.journeyDate
                    ? new Date(
                        `${booking.journeyDate}T00:00:00`
                      ).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Journey date unavailable"}
                </p>

              </div>

              <div
                className={`booking-status ${
                  isCancelled
                    ? "cancelled"
                    : ""
                }`}
              >
                {isCancelled
                  ? "CANCELLED"
                  : booking.bookingStatus || "CONFIRMED"}
              </div>

            </div>

            {/* JOURNEY */}

            <div className="booking-journey">

              <div className="booking-location">

                <span className="booking-small-label">
                  DEPARTURE
                </span>

                <strong>
                  {bus?.departure || "--:--"}
                </strong>

                <span>
                  {bus?.from || "-"}
                </span>

              </div>

              <div className="booking-duration">

                <span>
                  {bus?.duration || "-"}
                </span>

                <div className="booking-line">
                  →
                </div>

              </div>

              <div className="booking-location arrival">

                <span className="booking-small-label">
                  ARRIVAL
                </span>

                <strong>
                  {bus?.arrival || "--:--"}
                </strong>

                <span>
                  {bus?.to || "-"}
                </span>

              </div>

            </div>

            {/* DETAILS */}

            <div className="booking-details">

              <div>

                <span>
                  Booking ID
                </span>

                <strong>
                  {booking.bookingId || "N/A"}
                </strong>

              </div>

              <div>

                <span>
                  Bus
                </span>

                <strong>
                  {bus?.operator || "N/A"}
                </strong>

              </div>

              <div>

                <span>
                  Bus Type
                </span>

                <strong>
                  {bus?.type || "N/A"}
                </strong>

              </div>

              <div>

                <span>
                  Seats
                </span>

                <strong>
                  {booking.selectedSeats?.length
                    ? booking.selectedSeats.join(", ")
                    : "N/A"}
                </strong>

              </div>

            </div>

            {/* FARE */}

            <div className="booking-fare">

              <div>

                <span>
                  Passengers
                </span>

                <strong>
                  {booking.passengers?.length ||
                    booking.selectedSeats?.length ||
                    0}
                </strong>

              </div>

              <div>

                <span>
                  Price per seat
                </span>

                <strong>
                  ₹{booking.pricePerSeat || 0}
                </strong>

              </div>

              <div className="booking-total">

                <span>
                  Total Paid
                </span>

                <strong>
                  ₹{booking.totalFare || 0}
                </strong>

              </div>

            </div>

            {/* PAYMENT */}

            <div className="booking-payment">

              <span>
                Payment
              </span>

              <strong>
                {isCancelled
                  ? "↻ Refund Processing"
                  : booking.paymentStatus === "Paid"
                  ? "✓ Paid"
                  : booking.paymentStatus || "Pending"}
              </strong>

            </div>

            {/* ACTIONS */}

            <div className="booking-actions">

              <button
                className="primary-booking-btn"
                onClick={handleViewTicket}
              >
                View Ticket
                <span>
                  →
                </span>
              </button>

              {/* NEVER SHOW CANCEL FOR CANCELLED BOOKING */}

              {!isCancelled && (

                <button
                  className="secondary-booking-btn"
                  onClick={handleCancelBooking}
                >
                  Cancel Booking
                </button>

              )}

            </div>

          </div>

        )}

      </main>

      {/* FOOTER */}

      <footer className="my-bookings-footer">

        <strong>
          BusGo
        </strong>

        <span>
          Safe journeys. Simple bookings.
        </span>

      </footer>

    </div>
  );
}

export default MyBookings;
