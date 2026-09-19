import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Cancellation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [booking, setBooking] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Journey date unavailable";
    }

    try {
      return new Date(
        `${dateValue}T00:00:00`
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateValue;
    }
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (timeValue) => {
    if (!timeValue) {
      return "--:--";
    }

    try {
      const [hour, minute] = timeValue
        .split(":")
        .map(Number);

      const date = new Date();

      date.setHours(hour);
      date.setMinutes(minute);
      date.setSeconds(0);

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeValue;
    }
  };

  // =========================================================
  // FETCH USER BOOKINGS
  // =========================================================

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const currentUser = JSON.parse(
          localStorage.getItem(
            "busgoCurrentUser"
          ) || "null"
        );

        if (!currentUser?.id) {
          setError(
            "Please login to manage your booking."
          );

          setLoading(false);
          return;
        }

        const requestedBookingId =
          searchParams.get("bookingId");

        const response = await fetch(
          `${API_BASE_URL}/api/bookings/user/${currentUser.id}`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to fetch booking details."
          );
        }

        const data = await response.json();

        if (
          !data.success ||
          !Array.isArray(data.bookings) ||
          data.bookings.length === 0
        ) {
          setBooking(null);
          setLoading(false);
          return;
        }

        let selectedBooking = null;

        // ---------------------------------------------------
        // If MyBookings sends a booking ID,
        // use that exact booking.
        // ---------------------------------------------------

        if (requestedBookingId) {
          selectedBooking =
            data.bookings.find(
              (item) =>
                item.booking_id ===
                requestedBookingId
            );
        }

        // ---------------------------------------------------
        // Otherwise choose the latest CONFIRMED booking.
        // This avoids automatically selecting an already
        // cancelled booking.
        // ---------------------------------------------------

        if (!selectedBooking) {
          selectedBooking =
            data.bookings.find(
              (item) =>
                item.booking_status ===
                "Confirmed"
            );
        }

        // ---------------------------------------------------
        // If only cancelled booking exists
        // ---------------------------------------------------

        if (!selectedBooking) {
          selectedBooking =
            data.bookings[0];
        }

        if (!selectedBooking) {
          setBooking(null);
          setLoading(false);
          return;
        }

        const normalizedBooking = {
          ...selectedBooking,

          bookingId:
            selectedBooking.booking_id,

          bookingStatus:
            selectedBooking.booking_status,

          paymentStatus:
            selectedBooking.payment_status,

          selectedSeats:
            selectedBooking.selected_seats || [],

          totalFare:
            Number(
              selectedBooking.total_fare || 0
            ),

          journeyDate:
            selectedBooking.journey_date,

          bus: selectedBooking.bus
            ? {
                operator:
                  selectedBooking.bus.operator,

                from:
                  selectedBooking.bus.from,

                to:
                  selectedBooking.bus.to,

                departure:
                  selectedBooking.bus.departure,

                arrival:
                  selectedBooking.bus.arrival,

                duration:
                  selectedBooking.bus.duration,

                type:
                  selectedBooking.bus.type,

                price:
                  Number(
                    selectedBooking.bus.price || 0
                  ),
              }
            : null,

          passengers:
            selectedBooking.passengers || [],

          payment:
            selectedBooking.payment || null,
        };

        setBooking(normalizedBooking);

        if (
          normalizedBooking.bookingStatus ===
          "Cancelled"
        ) {
          setCancelled(true);
        }
      } catch (err) {
        console.error(
          "Cancellation booking error:",
          err
        );

        setError(
          "Unable to load booking details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [searchParams]);

  // =========================================================
  // BOOKING DATA
  // =========================================================

  const bus = booking?.bus;

  const selectedSeats =
    booking?.selectedSeats || [];

  const totalFare =
    Number(booking?.totalFare || 0);

  // =========================================================
  // CANCELLATION CALCULATION
  // =========================================================

  const cancellationCharge = Number(
    (totalFare * 0.1).toFixed(2)
  );

  const calculatedRefund = Number(
    (
      totalFare -
      cancellationCharge
    ).toFixed(2)
  );

  const refundAmount =
    Number(
      booking?.refundAmount ??
        calculatedRefund
    );

  // =========================================================
  // HANDLE CANCELLATION
  // =========================================================

  const handleCancellation = async (
    event
  ) => {
    event.preventDefault();

    // -------------------------------------------------------
    // Safety check
    // -------------------------------------------------------

    if (
      booking?.bookingStatus ===
      "Cancelled"
    ) {
      setCancelled(true);
      return;
    }

    // -------------------------------------------------------
    // Validate reason
    // -------------------------------------------------------

    if (!reason) {
      setError(
        "Please select a reason for cancellation."
      );

      return;
    }

    if (!booking?.bookingId) {
      setError(
        "Booking ID is missing. Unable to cancel booking."
      );

      return;
    }

    try {
      setProcessing(true);
      setError("");

      // -----------------------------------------------------
      // CALL BACKEND
      // -----------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/${booking.bookingId}/cancel`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            reason: reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to cancel booking."
        );
      }

      // -----------------------------------------------------
      // BACKEND CANCELLATION RESPONSE
      // -----------------------------------------------------

      const cancellation =
        data.cancellation;

      const updatedBooking = {
        ...booking,

        bookingStatus:
          cancellation?.booking_status ||
          "Cancelled",

        paymentStatus:
          cancellation?.payment_status ||
          "Refund Processing",

        cancellationReason:
          cancellation?.reason ||
          reason,

        cancellationDate:
          cancellation?.cancelled_at ||
          new Date().toISOString(),

        cancellationCharge:
          Number(
            cancellation?.cancellation_charge ??
              cancellationCharge
          ),

        refundAmount:
          Number(
            cancellation?.refund_amount ??
              calculatedRefund
          ),

        refundStatus:
          cancellation?.refund_status ||
          "Processing",

        selectedSeats:
          booking.selectedSeats,
      };

      // -----------------------------------------------------
      // Keep localStorage synchronized for old screens
      // -----------------------------------------------------

      localStorage.setItem(
        "busgoBooking",
        JSON.stringify(updatedBooking)
      );

      setBooking(updatedBooking);

      setCancelled(true);
    } catch (err) {
      console.error(
        "Cancellation failed:",
        err
      );

      setError(
        err.message ||
          "Cancellation failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="cancellation-page">

        <header className="cancellation-header">

          <div
            className="cancellation-logo"
            onClick={() => navigate("/")}
          >
            <span className="logo-icon">
              B
            </span>

            <span>
              BusGo
            </span>
          </div>

          <div className="cancellation-security">
            🔒 Secure Booking Management
          </div>

        </header>

        <main className="cancellation-container">

          <div className="cancellation-empty">

            <div className="cancellation-empty-icon">
              🚌
            </div>

            <h1>
              Loading booking...
            </h1>

            <p>
              Please wait while we load your
              booking details.
            </p>

          </div>

        </main>

        <footer className="cancellation-footer">

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

  // =========================================================
  // BOOKING NOT FOUND / ERROR
  // =========================================================

  if (!booking) {
    return (
      <div className="cancellation-page">

        <header className="cancellation-header">

          <div
            className="cancellation-logo"
            onClick={() => navigate("/")}
          >
            <span className="logo-icon">
              B
            </span>

            <span>
              BusGo
            </span>
          </div>

          <div className="cancellation-security">
            🔒 Secure Booking Management
          </div>

        </header>

        <main className="cancellation-container">

          <div className="cancellation-empty">

            <div className="cancellation-empty-icon">
              🚌
            </div>

            <h1>
              {error ||
                "Booking not found"}
            </h1>

            <p>
              We couldn't find an active
              booking to cancel.
            </p>

            <button
              className="primary-cancellation-btn"
              onClick={() =>
                navigate("/my-bookings")
              }
            >
              Back to My Bookings
              <span>→</span>
            </button>

          </div>

        </main>

        <footer className="cancellation-footer">

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

  // =========================================================
  // CANCELLATION SUCCESS
  // =========================================================

  if (cancelled) {
    return (
      <div className="cancellation-page">

        <header className="cancellation-header">

          <div
            className="cancellation-logo"
            onClick={() => navigate("/")}
          >
            <span className="logo-icon">
              B
            </span>

            <span>
              BusGo
            </span>
          </div>

          <div className="cancellation-security">
            🔒 Secure Booking Management
          </div>

        </header>

        <main className="cancellation-container">

          <div className="cancellation-title">

            <span className="section-label">
              CANCELLATION CONFIRMED
            </span>

            <h1>
              Your booking has been cancelled
            </h1>

            <p>
              Your cancellation request has
              been successfully submitted.
            </p>

          </div>

          <div className="cancellation-success-card">

            <div className="cancellation-success-icon">
              ✓
            </div>

            <span className="section-label">
              CANCELLATION CONFIRMED
            </span>

            <h1>
              Your booking has been cancelled
            </h1>

            <p>
              Your cancellation request has
              been successfully submitted.
            </p>

            {/* REFUND CARD */}

            <div className="refund-card">

              <div>

                <span>
                  BOOKING ID
                </span>

                <strong>
                  {booking.bookingId}
                </strong>

              </div>

              <div>

                <span>
                  REFUND AMOUNT
                </span>

                <strong>
                  ₹
                  {Number(
                    refundAmount
                  ).toFixed(2)}
                </strong>

              </div>

              <div>

                <span>
                  REFUND STATUS
                </span>

                <strong className="refund-processing">
                  {booking.refundStatus ||
                    "Processing"}
                </strong>

              </div>

            </div>

            <p className="refund-note">

              Your refund of ₹
              {Number(
                refundAmount
              ).toFixed(2)}
              {" "}is being processed. The amount
              will be returned to your original
              payment method.

            </p>

            {/* ACTIONS */}

            <div className="cancellation-success-actions">

              <button
                className="primary-cancellation-btn"
                onClick={() =>
                  navigate("/my-bookings")
                }
              >
                View My Bookings
                <span>
                  →
                </span>
              </button>

              <button
                className="secondary-cancellation-btn"
                onClick={() =>
                  navigate("/")
                }
              >
                Back to Home
              </button>

            </div>

          </div>

        </main>

        <footer className="cancellation-footer">

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

  // =========================================================
  // MAIN CANCELLATION PAGE
  // =========================================================

  return (
    <div className="cancellation-page">

      {/* HEADER */}

      <header className="cancellation-header">

        <div
          className="cancellation-logo"
          onClick={() => navigate("/")}
        >
          <span className="logo-icon">
            B
          </span>

          <span>
            BusGo
          </span>
        </div>

        <div className="cancellation-security">
          🔒 Secure Booking Management
        </div>

      </header>

      {/* MAIN */}

      <main className="cancellation-container">

        <div className="cancellation-title">

          <span className="section-label">
            CANCEL BOOKING
          </span>

          <h1>
            Cancel your journey
          </h1>

          <p>
            Review your booking and
            cancellation details before
            confirming.
          </p>

        </div>

        <div className="cancellation-layout">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="cancellation-main">

            {/* BOOKING DETAILS */}

            <section className="cancellation-card">

              <div className="cancellation-card-header">

                <div>

                  <span className="booking-card-label">
                    BUSGO BOOKING
                  </span>

                  <h2>
                    {bus?.from ||
                      "Chennai"}
                    {" → "}
                    {bus?.to ||
                      "Bengaluru"}
                  </h2>

                  <p>
                    {formatDate(
                      booking.journeyDate
                    )}
                  </p>

                </div>

                <div className="cancel-status">
                  {booking.bookingStatus ||
                    "Confirmed"}
                </div>

              </div>

              {/* JOURNEY */}

              <div className="cancel-journey">

                <div>

                  <span>
                    DEPARTURE
                  </span>

                  <strong>
                    {formatTime(
                      bus?.departure
                    )}
                  </strong>

                  <small>
                    {bus?.from || "-"}
                  </small>

                </div>

                <div className="cancel-journey-line">

                  <span>
                    {bus?.duration ||
                      "-"}
                  </span>

                  <div>
                    ─────────→
                  </div>

                </div>

                <div className="cancel-arrival">

                  <span>
                    ARRIVAL
                  </span>

                  <strong>
                    {formatTime(
                      bus?.arrival
                    )}
                  </strong>

                  <small>
                    {bus?.to || "-"}
                  </small>

                </div>

              </div>

              {/* DETAILS */}

              <div className="cancel-details">

                <div>

                  <span>
                    Booking ID
                  </span>

                  <strong>
                    {booking.bookingId}
                  </strong>

                </div>

                <div>

                  <span>
                    Bus
                  </span>

                  <strong>
                    {bus?.operator ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    Bus Type
                  </span>

                  <strong>
                    {bus?.type ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    Seats
                  </span>

                  <strong>
                    {selectedSeats.length
                      ? selectedSeats.join(
                          ", "
                        )
                      : "N/A"}
                  </strong>

                </div>

              </div>

            </section>

            {/* REASON */}

            <section className="cancellation-card">

              <h2>
                Why are you cancelling?
              </h2>

              <p className="cancellation-description">
                Select the reason that best
                describes your cancellation.
              </p>

              <form
                onSubmit={
                  handleCancellation
                }
              >

                <div className="cancellation-field">

                  <label>
                    Cancellation reason *
                  </label>

                  <select
                    value={reason}
                    onChange={(event) => {
                      setReason(
                        event.target.value
                      );

                      setError("");
                    }}
                    disabled={processing}
                  >

                    <option value="">
                      Select a reason
                    </option>

                    <option value="Travel plans changed">
                      Travel plans changed
                    </option>

                    <option value="Found another bus">
                      Found another bus
                    </option>

                    <option value="Change of schedule">
                      Change of schedule
                    </option>

                    <option value="Personal reasons">
                      Personal reasons
                    </option>

                    <option value="Booked by mistake">
                      Booked by mistake
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {error && (
                  <div className="cancellation-error">
                    {error}
                  </div>
                )}

                {/* POLICY */}

                <div className="cancellation-policy">

                  <strong>
                    Cancellation policy
                  </strong>

                  <p>
                    A 10% cancellation charge
                    applies to this demo booking.
                    The remaining amount will be
                    refunded to your original
                    payment method.
                  </p>

                </div>

                <button
                  type="submit"
                  className="cancel-confirm-btn"
                  disabled={processing}
                >

                  {processing
                    ? "Cancelling..."
                    : "Confirm Cancellation"}

                  {!processing && (
                    <span>
                      →
                    </span>
                  )}

                </button>

              </form>

            </section>

          </div>

          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <aside className="cancellation-summary">

            <div className="cancellation-summary-card">

              <span className="section-label">
                REFUND SUMMARY
              </span>

              <h2>
                Cancellation details
              </h2>

              <div className="cancellation-summary-row">

                <span>
                  Total paid
                </span>

                <strong>
                  ₹
                  {totalFare.toFixed(2)}
                </strong>

              </div>

              <div className="cancellation-summary-row">

                <span>
                  Cancellation charge
                </span>

                <strong>
                  - ₹
                  {cancellationCharge.toFixed(
                    2
                  )}
                </strong>

              </div>

              <div className="cancellation-divider" />

              <div className="refund-total">

                <span>
                  Estimated refund
                </span>

                <strong>
                  ₹
                  {calculatedRefund.toFixed(
                    2
                  )}
                </strong>

              </div>

              <div className="refund-info">

                <span>
                  💳
                </span>

                <p>
                  Refund will be processed to
                  your original payment method.
                </p>

              </div>

            </div>

            <button
              className="back-booking-btn"
              onClick={() =>
                navigate("/my-bookings")
              }
            >
              ← Back to My Bookings
            </button>

          </aside>

        </div>

      </main>

      {/* FOOTER */}

      <footer className="cancellation-footer">

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

export default Cancellation;
