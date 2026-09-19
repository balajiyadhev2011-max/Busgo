import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

function Payment() {
  const navigate = useNavigate();

  const passengerData = JSON.parse(
    localStorage.getItem("busgoPassengerDetails") || "null"
  );

  const bookingData = JSON.parse(
    localStorage.getItem("busgoBooking") || "null"
  );

  const currentUser = JSON.parse(
    localStorage.getItem("busgoCurrentUser") || "null"
  );
  
  const journeyDate =
    bookingData?.journeyDate ||
    bookingData?.date ||
    new Date().toISOString().split("T")[0];

  const busId = bookingData?.busId || "2";

  const selectedSeats =
    bookingData?.selectedSeats || [];

  const bus = buses[busId] || buses[2];

  const pricePerSeat = bus.price;

  const totalFare =
    selectedSeats.length * pricePerSeat;

  const [paymentMethod, setPaymentMethod] =
    useState("upi");

  const [upiId, setUpiId] = useState("");

  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [error, setError] = useState("");

  const handleCardChange = (event) => {
    setCard({
      ...card,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  const handlePayment = async (event) => {
    event.preventDefault();
  
    setError("");
  
    // --------------------------------------------------
    // USER CHECK
    // --------------------------------------------------
  
    if (!currentUser?.id) {
      setError("Please login before making a payment.");
      return;
    }
  
    // --------------------------------------------------
    // BOOKING DATA CHECK
    // --------------------------------------------------
  
    if (!bookingData?.busId) {
      setError("Booking information is missing.");
      return;
    }
  
    if (!selectedSeats.length) {
      setError("Please select at least one seat.");
      return;
    }
  
    // --------------------------------------------------
    // UPI VALIDATION
    // --------------------------------------------------
  
    if (paymentMethod === "upi") {
      if (!upiId.trim()) {
        setError("Please enter your UPI ID.");
        return;
      }
  
      if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
        setError("Please enter a valid UPI ID.");
        return;
      }
    }
  
    // --------------------------------------------------
    // CARD VALIDATION
    // --------------------------------------------------
  
    if (paymentMethod === "card") {
      if (
        !card.number ||
        !card.name ||
        !card.expiry ||
        !card.cvv
      ) {
        setError("Please complete all card details.");
        return;
      }
  
      if (
        card.number.replace(/\s/g, "").length !== 16
      ) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
  
      if (card.cvv.length !== 3) {
        setError("Please enter a valid 3-digit CVV.");
        return;
      }
    }
  
    // --------------------------------------------------
    // NET BANKING
    // --------------------------------------------------
  
    if (paymentMethod === "netbanking") {
      // Demo payment method.
    }
  
    try {
      // ------------------------------------------------
      // PASSENGER DATA
      // ------------------------------------------------
  
      let passengers = [];
  
      if (Array.isArray(passengerData)) {
        passengers = passengerData;
      } else if (passengerData?.passengers) {
        passengers = passengerData.passengers;
      } else if (passengerData) {
        passengers = [passengerData];
      }
  
      // ------------------------------------------------
      // MAKE SURE EVERY SEAT HAS A PASSENGER
      // ------------------------------------------------
  
      if (passengers.length !== selectedSeats.length) {
        setError(
          "Passenger details do not match the selected seats."
        );
        return;
      }
  
      const formattedPassengers = passengers.map(
        (passenger, index) => ({
          full_name:
            passenger.full_name ||
            passenger.fullName ||
            passenger.name ||
            `Passenger ${index + 1}`,
  
          age: Number(passenger.age),
  
          gender:
            passenger.gender || "Other",
  
          seat_number:
            passenger.seat_number ||
            passenger.seatNumber ||
            selectedSeats[index],
        })
      );
  
      // ------------------------------------------------
      // TRANSACTION ID
      // ------------------------------------------------
  
      const transactionId =
        "TXN" +
        Date.now().toString().slice(-10);
  
      // ------------------------------------------------
      // BOOKING API REQUEST
      // ------------------------------------------------
  
      const response = await fetch(
        `${API_BASE_URL}/api/bookings`,
        {
          method: "POST",
  
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
  
          body: JSON.stringify({
            user_id: currentUser.id,
  
            bus_id: Number(busId),
  
            journey_date: journeyDate,
  
            selected_seats: selectedSeats,
  
            passengers: formattedPassengers,
  
            total_fare: totalFare,
  
            payment_method: paymentMethod,
  
            transaction_id: transactionId,
          }),
        }
      );
  
      const data = await response.json();
  
      // ------------------------------------------------
      // API ERROR
      // ------------------------------------------------
  
      if (!response.ok) {
        setError(
          data?.detail ||
          "Booking failed. Please try again."
        );
  
        return;
      }
  
      // ------------------------------------------------
      // SAVE BACKEND BOOKING LOCALLY
      // ------------------------------------------------
  
      const booking = {
        ...bookingData,
  
        bookingId:
          data.booking?.booking_id,
  
        backendBookingId:
          data.booking?.id,
  
        busId: Number(busId),
  
        bus,
  
        selectedSeats,
  
        pricePerSeat,
  
        totalFare,
  
        passengerData,
  
        paymentMethod,
  
        journeyDate,
  
        transactionId:
          data.booking?.transaction_id ||
          transactionId,
  
        paymentStatus:
          data.booking?.payment_status ||
          "Paid",
  
        bookingStatus:
          data.booking?.booking_status ||
          "Confirmed",
  
        status: "Confirmed",
  
        bookingDate:
          new Date().toISOString(),
      };
  
      localStorage.setItem(
        "busgoBooking",
        JSON.stringify(booking)
      );
  
      // ------------------------------------------------
      // GO TO CONFIRMATION
      // ------------------------------------------------
  
      navigate("/booking-confirmation");
  
    } catch (error) {
      console.error(
        "BOOKING API ERROR:",
        error
      );
  
      setError(
        "Unable to connect to the booking server."
      );
    }
  };
    
    
  return (
    <div className="payment-page">

      {/* HEADER */}

      <header className="payment-header">

        <div
          className="payment-logo"
          onClick={() => navigate("/")}
        >
          <span className="logo-icon">B</span>
          <span>BusGo</span>
        </div>

        <div className="payment-security">
          🔒 Secure Payment
        </div>

      </header>


      {/* PROGRESS */}

      <div className="payment-progress">

        <span className="completed">
          ✓ Search
        </span>

        <span className="completed">
          ✓ Seat
        </span>

        <span className="completed">
          ✓ Passenger
        </span>

        <span className="active">
          4 Payment
        </span>

        <span>
          5 Confirmation
        </span>

      </div>


      {/* MAIN */}

      <main className="payment-container">

        <div className="payment-main">

          <div className="payment-title">

            <span className="section-label">
              PAYMENT
            </span>

            <h1>
              Complete your payment
            </h1>

            <p>
              Choose your preferred payment method
              to confirm your BusGo booking.
            </p>

          </div>


          <form onSubmit={handlePayment}>

            {/* PAYMENT METHODS */}

            <section className="payment-card">

              <h2>
                Payment method
              </h2>

              <p className="payment-description">
                Select how you would like to pay.
              </p>


              <div className="payment-methods">

                <button
                  type="button"
                  className={
                    paymentMethod === "upi"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() => {
                    setPaymentMethod("upi");
                    setError("");
                  }}
                >
                  <span className="payment-method-icon">
                    UPI
                  </span>

                  <span>
                    <strong>UPI</strong>
                    <small>
                      Google Pay, PhonePe, Paytm
                    </small>
                  </span>
                </button>


                <button
                  type="button"
                  className={
                    paymentMethod === "card"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() => {
                    setPaymentMethod("card");
                    setError("");
                  }}
                >
                  <span className="payment-method-icon">
                    💳
                  </span>

                  <span>
                    <strong>Card</strong>
                    <small>
                      Credit or Debit Card
                    </small>
                  </span>
                </button>


                <button
                  type="button"
                  className={
                    paymentMethod === "netbanking"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() => {
                    setPaymentMethod("netbanking");
                    setError("");
                  }}
                >
                  <span className="payment-method-icon">
                    🏦
                  </span>

                  <span>
                    <strong>Net Banking</strong>
                    <small>
                      All major banks
                    </small>
                  </span>
                </button>

              </div>

            </section>


            {/* UPI */}

            {paymentMethod === "upi" && (

              <section className="payment-card">

                <h2>
                  Pay using UPI
                </h2>

                <p className="payment-description">
                  Enter your UPI ID to continue.
                </p>

                <div className="payment-field">

                  <label>
                    UPI ID *
                  </label>

                  <input
                    type="text"
                    placeholder="example@upi"
                    value={upiId}
                    onChange={(event) => {
                      setUpiId(event.target.value);
                      setError("");
                    }}
                  />

                </div>

              </section>

            )}


            {/* CARD */}

            {paymentMethod === "card" && (

              <section className="payment-card">

                <h2>
                  Card details
                </h2>

                <p className="payment-description">
                  Enter your card details securely.
                </p>

                <div className="payment-field">

                  <label>
                    Card Number *
                  </label>

                  <input
                    type="text"
                    name="number"
                    maxLength="19"
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(event) => {
                      const value =
                        event.target.value
                          .replace(/\D/g, "")
                          .replace(/(.{4})/g, "$1 ")
                          .trim();

                      setCard({
                        ...card,
                        number: value,
                      });

                      setError("");
                    }}
                  />

                </div>


                <div className="payment-two-column">

                  <div className="payment-field">

                    <label>
                      Cardholder Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Name on card"
                      value={card.name}
                      onChange={handleCardChange}
                    />

                  </div>


                  <div className="payment-field">

                    <label>
                      Expiry *
                    </label>

                    <input
                      type="text"
                      name="expiry"
                      maxLength="5"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={handleCardChange}
                    />

                  </div>

                </div>


                <div className="payment-field">

                  <label>
                    CVV *
                  </label>

                  <input
                    type="password"
                    name="cvv"
                    maxLength="3"
                    placeholder="•••"
                    value={card.cvv}
                    onChange={handleCardChange}
                  />

                </div>

              </section>

            )}


            {/* NET BANKING */}

            {paymentMethod === "netbanking" && (

              <section className="payment-card">

                <h2>
                  Net Banking
                </h2>

                <p className="payment-description">
                  Select your bank to continue.
                </p>

                <div className="payment-field">

                  <label>
                    Select Bank
                  </label>

                  <select>
                    <option>
                      Select your bank
                    </option>

                    <option>
                      State Bank of India
                    </option>

                    <option>
                      HDFC Bank
                    </option>

                    <option>
                      ICICI Bank
                    </option>

                    <option>
                      Axis Bank
                    </option>

                    <option>
                      Kotak Mahindra Bank
                    </option>

                  </select>

                </div>

              </section>

            )}


            {/* ERROR */}

            {error && (

              <div className="payment-error">
                {error}
              </div>

            )}


            {/* PAY */}

            <button
              type="submit"
              className="payment-pay-btn"
            >
              Pay ₹{totalFare}
              <span>→</span>
            </button>


            <p className="payment-secure-note">
              🔒 Your payment information is encrypted
              and securely processed.
            </p>

          </form>

        </div>


        {/* SUMMARY */}

        <aside className="payment-summary">

          <div className="payment-summary-card">

            <span className="section-label">
              BOOKING SUMMARY
            </span>

            <h2>
              {bus.from} → {bus.to}
            </h2>

            <p className="summary-date">
            {new Date(`${journeyDate}T00:00:00`).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}
          </p>


            <div className="summary-divider-line" />


            <div className="summary-row">

              <span>
                Bus
              </span>

              <strong>
                {bus.operator}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                Bus type
              </span>

              <strong>
                {bus.type}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                Departure
              </span>

              <strong>
                {bus.departure}
              </strong>

            </div>


            <div className="summary-divider-line" />


            <div className="summary-seat-title">
              Selected seats
            </div>


            <div className="summary-seats">

              {selectedSeats.length > 0 ? (

                selectedSeats.map((seat) => (

                  <div
                    className="summary-seat"
                    key={seat}
                  >
                    Seat {seat}
                  </div>

                ))

              ) : (

                <div className="no-seats">
                  No seats selected
                </div>

              )}

            </div>


            <div className="summary-divider-line" />


            <div className="fare-row">

              <span>
                Passengers
              </span>

              <strong>
                {selectedSeats.length}
              </strong>

            </div>


            <div className="fare-row">

              <span>
                Price per seat
              </span>

              <strong>
                ₹{pricePerSeat}
              </strong>

            </div>


            <div className="total-row">

              <span>
                Total fare
              </span>

              <strong>
                ₹{totalFare}
              </strong>

            </div>

          </div>

        </aside>

      </main>

    </div>
  );
}


export default Payment;
