import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import "../App.css";


const buses = {
    1: {
      operator: "GreenLine Travels",
      rating: "4.6",
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
      rating: "4.4",
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
      rating: "4.7",
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
      rating: "4.3",
      from: "Chennai",
      to: "Bengaluru",
      departure: "08:30 PM",
      arrival: "04:30 AM",
      duration: "8h 00m",
      type: "Non AC Sleeper",
      price: 549,
    },
  };

function PassengerDetails() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

const busId = searchParams.get("busId") || "1";

const seatsParam = searchParams.get("seats") || "";

const selectedSeats = seatsParam
  ? seatsParam.split(",")
  : [];

  const bus = buses[busId] || buses[1];

const pricePerSeat = bus.price;

const totalFare =
  selectedSeats.length * pricePerSeat;

  const [contact, setContact] = useState({
    email: "",
    mobile: "",
  });

  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat) => ({
      seat,
      fullName: "",
      age: "",
      gender: "",
    }))
  );

  const [error, setError] = useState("");

  

  const handleContactChange = (event) => {
    setContact({
      ...contact,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  const handlePassengerChange = (
    index,
    field,
    value
  ) => {
    const updatedPassengers = [...passengers];

    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value,
    };

    setPassengers(updatedPassengers);
    setError("");
  };

  const handleContinue = (event) => {
    event.preventDefault();

    if (selectedSeats.length === 0) {
      setError(
        "No seats selected. Please select your seats again."
      );
      return;
    }

    if (!contact.email || !contact.mobile) {
      setError(
        "Please enter your contact information."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        contact.email
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(contact.mobile)) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];

      if (
        !passenger.fullName ||
        !passenger.age ||
        !passenger.gender
      ) {
        setError(
          `Please complete Passenger ${i + 1} details.`
        );
        return;
      }

      const age = Number(passenger.age);

      if (age < 1 || age > 100) {
        setError(
          `Please enter a valid age for Passenger ${
            i + 1
          }.`
        );
        return;
      }
    }

    // Save passenger information
    localStorage.setItem(
      "busgoPassengerDetails",
      JSON.stringify({
        contact,
        passengers,
        totalFare,
      })
    );

    // Save the selected bus and seats for the Payment page.
    // PassengerDetails receives these values from the URL:
    // /passenger-details?busId=2&seats=U7,U12
    localStorage.setItem(
      "busgoBooking",
      JSON.stringify({
        busId,
        selectedSeats,
        pricePerSeat,
        totalFare,
      })
    );

    navigate("/payment");
  };

  return (
    <div className="passenger-page">

      {/* HEADER */}

      <header className="passenger-header">

        <div
          className="passenger-logo"
          onClick={() => navigate("/")}
        >
          <span className="logo-icon">B</span>
          <span>BusGo</span>
        </div>

        <div className="booking-progress">
          <span className="completed">
            ✓ Search
          </span>

          <span className="completed">
            ✓ Seat
          </span>

          <span className="active">
            3 Passenger
          </span>

          <span>
            4 Payment
          </span>

          <span>
            5 Confirmation
          </span>
        </div>

      </header>


      {/* MAIN */}

      <main className="passenger-container">

        <div className="passenger-main">

          <div className="passenger-title">

            <span className="section-label">
              PASSENGER INFORMATION
            </span>

            <h1>
              Passenger details
            </h1>

            <p>
              Enter the details of everyone travelling on
              this booking.
            </p>

          </div>


          <form onSubmit={handleContinue}>

            {/* CONTACT */}

            <section className="passenger-card">

              <div className="card-heading">

                <div>
                  <h2>
                    Contact information
                  </h2>

                  <p>
                    Your ticket and booking updates will be
                    sent to these details.
                  </p>
                </div>

              </div>


              <div className="passenger-two-column">

                <div className="passenger-field">

                  <label>
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={contact.email}
                    onChange={handleContactChange}
                  />

                </div>


                <div className="passenger-field">

                  <label>
                    Mobile Number *
                  </label>

                  <div className="passenger-mobile">

                    <span>
                      +91
                    </span>

                    <input
                      type="tel"
                      name="mobile"
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      value={contact.mobile}
                      onChange={handleContactChange}
                    />

                  </div>

                </div>

              </div>

            </section>


            {/* PASSENGERS */}

            {passengers.map(
              (passenger, index) => (

                <section
                  className="passenger-card"
                  key={passenger.seat}
                >

                  <div className="passenger-card-top">

                    <div>

                      <span className="passenger-number">
                        PASSENGER {index + 1}
                      </span>

                      <h2>
                        Passenger {index + 1}
                      </h2>

                    </div>

                    <div className="seat-badge">
                      Seat {passenger.seat}
                    </div>

                  </div>


                  <div className="passenger-form-grid">

                    {/* NAME */}

                    <div className="passenger-field full">

                      <label>
                        Full Name *
                      </label>

                      <input
                        type="text"
                        placeholder="Enter passenger full name"
                        value={passenger.fullName}
                        onChange={(event) =>
                          handlePassengerChange(
                            index,
                            "fullName",
                            event.target.value
                          )
                        }
                      />

                    </div>


                    {/* AGE */}

                    <div className="passenger-field">

                      <label>
                        Age *
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Age"
                        value={passenger.age}
                        onChange={(event) =>
                          handlePassengerChange(
                            index,
                            "age",
                            event.target.value
                          )
                        }
                      />

                    </div>


                    {/* GENDER */}

                    <div className="passenger-field">

                      <label>
                        Gender *
                      </label>

                      <select
                        value={passenger.gender}
                        onChange={(event) =>
                          handlePassengerChange(
                            index,
                            "gender",
                            event.target.value
                          )
                        }
                      >

                        <option value="">
                          Select gender
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                  </div>

                </section>

              )
            )}


            {/* ERROR */}

            {error && (

              <div className="passenger-error">
                {error}
              </div>

            )}


            <button
              type="submit"
              className="payment-continue-btn"
            >
              Continue to Payment
              <span>→</span>
            </button>

          </form>

        </div>


        {/* BOOKING SUMMARY */}

        <aside className="passenger-summary">

          <div className="summary-card">

            <span className="section-label">
              BOOKING SUMMARY
            </span>

            <h2>
              {bus.from} → {bus.to}
            </h2>

            <p className="summary-date">
              18 Sep 2026
            </p>


            <div className="summary-divider-line"></div>


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


            <div className="summary-divider-line"></div>


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

                    <span>
                      Seat {seat}
                    </span>

                    <strong>
                      ₹{pricePerSeat}
                    </strong>

                  </div>

                ))
              ) : (

                <div className="no-seats">
                  No seats selected
                </div>

              )}

            </div>


            <div className="summary-divider-line"></div>


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

export default PassengerDetails;