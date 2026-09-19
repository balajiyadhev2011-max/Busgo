import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../App.css";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// ============================================================
// TIME FORMATTER
// ============================================================

function formatTime(time24) {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":");

  const date = new Date();

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  date.setSeconds(0);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}


// ============================================================
// COMPONENT
// ============================================================

function SeatSelection() {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();


  // ==========================================================
  // PARAMETERS
  // ==========================================================

  const busId = searchParams.get("busId") || "1";
  const journeyDate =
    searchParams.get("date") || "2026-09-18";


  // ==========================================================
  // STATE
  // ==========================================================

  const [bus, setBus] = useState(null);

  const [seats, setSeats] = useState([]);

  const [selectedSeats, setSelectedSeats] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ==========================================================
  // FETCH BUS + SEATS FROM DATABASE
  // ==========================================================

  useEffect(() => {

    const fetchBusData = async () => {

      try {

        setLoading(true);
        setError("");


        // ----------------------------------------------------
        // Fetch selected bus
        // ----------------------------------------------------

        const busResponse = await fetch(
          `${API_BASE_URL}/api/buses/${busId}`
        );


        if (!busResponse.ok) {

          throw new Error(
            `Failed to fetch bus (${busResponse.status})`
          );

        }


        const busData = await busResponse.json();


        // ----------------------------------------------------
        // Convert backend bus data to existing UI structure
        // ----------------------------------------------------

        const formattedBus = {

          ...busData,

          departure: formatTime(
            busData.departureTime
          ),

          arrival: formatTime(
            busData.arrivalTime
          ),

          type: busData.busType,

        };


        // ----------------------------------------------------
        // Fetch seats for selected bus
        // ----------------------------------------------------

        const seatsResponse = await fetch(
          `${API_BASE_URL}/api/buses/${busId}/seats`
        );


        if (!seatsResponse.ok) {

          throw new Error(
            `Failed to fetch seats (${seatsResponse.status})`
          );

        }


        const seatsData = await seatsResponse.json();


        // ----------------------------------------------------
        // Convert backend seat data to existing UI structure
        // ----------------------------------------------------

        const formattedSeats = seatsData.map((seat) => ({

          id: seat.seatNumber,

          type: seat.seatType,

          status: seat.status,

          seatId: seat.id,

        }));


        setBus(formattedBus);

        setSeats(formattedSeats);

      } catch (err) {

        console.error(
          "Seat Selection API Error:",
          err
        );

        setError(
          "Unable to load bus and seat information. Please make sure the BusGo backend is running."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchBusData();

  }, [busId]);


  // ==========================================================
  // SEAT SELECTION
  // ==========================================================

  const handleSeatClick = (seat) => {

    if (seat.status === "booked") {
      return;
    }


    setSelectedSeats((current) => {

      // ------------------------------------------------------
      // Deselect seat
      // ------------------------------------------------------

      if (current.includes(seat.id)) {

        return current.filter(
          (id) => id !== seat.id
        );

      }


      // ------------------------------------------------------
      // Maximum 4 seats
      // ------------------------------------------------------

      if (current.length >= 4) {

        alert(
          "You can select a maximum of 4 seats."
        );

        return current;

      }


      // ------------------------------------------------------
      // Select seat
      // ------------------------------------------------------

      return [
        ...current,
        seat.id,
      ];

    });

  };


  // ==========================================================
  // FARE
  // ==========================================================

  const totalFare =
    selectedSeats.length *
    (bus?.price || 0);


  // ==========================================================
  // CONTINUE
  // ==========================================================

  const handleContinue = () => {

    if (selectedSeats.length === 0) {

      alert(
        "Please select at least one seat."
      );

      return;

    }


    const seatsQuery =
      selectedSeats.join(",");


    navigate(
      `/passenger-details?busId=${busId}&seats=${seatsQuery}`
    );

  };


  // ==========================================================
  // RENDER SEAT
  // ==========================================================

  const renderSeat = (seat) => {

    const isSelected =
      selectedSeats.includes(
        seat.id
      );


    let className =
      "bus-seat";


    if (seat.status === "booked") {

      className += " booked";

    }


    if (isSelected) {

      className += " selected";

    }


    return (

      <button
        key={seat.id}
        className={className}
        disabled={
          seat.status === "booked"
        }
        onClick={() =>
          handleSeatClick(seat)
        }
      >

        <span className="seat-icon">
          ▰
        </span>


        <span>
          {seat.id}
        </span>

      </button>

    );

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="seat-page">

        <header className="search-header">

          <div
            className="search-logo"
            onClick={() => navigate("/")}
          >

            <span className="logo-icon">
              B
            </span>

            <span>
              BusGo
            </span>

          </div>

        </header>


        <main className="seat-container">

          <div className="seat-title">

            <div>

              <span className="section-label">
                SELECT YOUR SEAT
              </span>

              <h1>
                Loading bus details...
              </h1>

              <p>
                Loading seats from BusGo database.
              </p>

            </div>

          </div>

        </main>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !bus) {

    return (

      <div className="seat-page">

        <header className="search-header">

          <div
            className="search-logo"
            onClick={() => navigate("/")}
          >

            <span className="logo-icon">
              B
            </span>

            <span>
              BusGo
            </span>

          </div>

        </header>


        <main className="seat-container">

          <div className="seat-title">

            <div>

              <span className="section-label">
                SELECT YOUR SEAT
              </span>

              <h1>
                Unable to load bus
              </h1>

              <p>
                {error ||
                  "Bus information was not found."}
              </p>


              <button
                className="seat-back-btn"
                onClick={() => navigate(-1)}
              >
                ← Back to buses
              </button>

            </div>

          </div>

        </main>

      </div>

    );

  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div className="seat-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="search-header">

        <div
          className="search-logo"
          onClick={() => navigate("/")}
        >

          <span className="logo-icon">
            B
          </span>

          <span>
            BusGo
          </span>

        </div>


        <div className="search-header-links">

          <span>
            Manage Booking
          </span>

          <span>
            Track Bus
          </span>

          <span>
            Help
          </span>

        </div>


        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

      </header>



      {/* =====================================================
          JOURNEY HEADER
      ===================================================== */}

      <section className="seat-journey-header">

        <div className="seat-header-inner">


          <button
            className="seat-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back to buses
          </button>


          <div className="seat-journey">


            <div>

              <span>
                FROM
              </span>

              <strong>
                {bus.from}
              </strong>

            </div>


            <div className="seat-route-line">
              ───────── →
            </div>


            <div>

              <span>
                TO
              </span>

              <strong>
                {bus.to}
              </strong>

            </div>


            <div className="seat-divider"></div>


            <div>

              <span>
                BUS
              </span>

              <strong>
                {bus.operator}
              </strong>

            </div>


          </div>

        </div>

      </section>



      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="seat-container">


        {/* ===================================================
            PAGE TITLE
        =================================================== */}

        <div className="seat-title">

          <div>

            <span className="section-label">
              SELECT YOUR SEAT
            </span>

            <h1>
              Choose your seats
            </h1>

            <p>
              Select up to 4 seats for your journey.
            </p>

          </div>

        </div>



        {/* ===================================================
            BUS INFO
        =================================================== */}

        <div className="seat-bus-info">


          <div className="seat-bus-operator">

            <div className="seat-operator-logo">

              {bus.operator.charAt(0)}

            </div>


            <div>

              <h3>
                {bus.operator}
              </h3>

              <span>
                ★ {bus.rating}
              </span>

            </div>

          </div>



          <div className="seat-bus-timing">


            <div>

              <strong>
                {bus.departure}
              </strong>

              <span>
                {bus.from}
              </span>

            </div>


            <div className="seat-duration">

              <span>
                {bus.duration}
              </span>

              <div></div>

            </div>


            <div>

              <strong>
                {bus.arrival}
              </strong>

              <span>
                {bus.to}
              </span>

            </div>


          </div>



          <div className="seat-bus-type">

            <strong>
              {bus.type}
            </strong>

            <span>
              ₹{bus.price} / seat
            </span>

          </div>


        </div>



        {/* ===================================================
            SEAT CONTENT
        =================================================== */}

        <div className="seat-layout">


          {/* =================================================
              BUS
          ================================================= */}

          <section className="bus-layout-card">


            <div className="bus-layout-header">

              <div>

                <h2>
                  Select your seat
                </h2>

                <p>
                  Click on an available seat to select it.
                </p>

              </div>


              <div className="driver-area">
                DRIVER
              </div>

            </div>



            {/* =================================================
                BUS BODY
            ================================================= */}

            <div className="bus-body">


              {/* FRONT */}

              <div className="bus-front">

                <span>
                  FRONT
                </span>

                <div className="steering">
                  ◉
                </div>

              </div>



              {/* =================================================
                  UPPER BERTH
              ================================================= */}

              <div className="seat-section">

                <div className="seat-section-title">
                  Upper Berth
                </div>


                <div className="seat-grid">

                  {seats
                    .filter(
                      (seat) =>
                        seat.type === "upper"
                    )
                    .map(renderSeat)}

                </div>

              </div>



              {/* =================================================
                  LOWER BERTH
              ================================================= */}

              <div className="seat-section">

                <div className="seat-section-title">
                  Lower Berth
                </div>


                <div className="seat-grid">

                  {seats
                    .filter(
                      (seat) =>
                        seat.type === "lower"
                    )
                    .map(renderSeat)}

                </div>

              </div>



              {/* BUS EXIT */}

              <div className="bus-exit">
                EXIT
              </div>


            </div>



            {/* =================================================
                LEGEND
            ================================================= */}

            <div className="seat-legend">

              <div>

                <span className="legend-box available"></span>

                Available

              </div>


              <div>

                <span className="legend-box selected"></span>

                Selected

              </div>


              <div>

                <span className="legend-box booked"></span>

                Booked

              </div>

            </div>


          </section>



          {/* =================================================
              SELECTION SUMMARY
          ================================================= */}

          <aside className="selection-summary">


            <h2>
              Your selection
            </h2>



            {/* JOURNEY */}

            <div className="selection-route">

              <span>
                JOURNEY
              </span>

              <strong>
                {bus.from} → {bus.to}
              </strong>

              <small>
                {new Date(
                  journeyDate
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </small>

            </div>



            {/* SELECTED SEATS */}

            <div className="selected-seat-section">

              <span>
                SELECTED SEATS
              </span>


              {selectedSeats.length === 0 ? (

                <div className="no-seat">
                  No seats selected
                </div>

              ) : (

                <div className="selected-seat-list">

                  {selectedSeats.map(
                    (seatId) => (

                      <div
                        className="selected-seat-item"
                        key={seatId}
                      >

                        <span>
                          Seat {seatId}
                        </span>

                        <strong>
                          ₹{bus.price}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>



            {/* PRICE */}

            <div className="fare-summary">


              <div>

                <span>
                  Seats
                </span>

                <strong>
                  {selectedSeats.length}
                </strong>

              </div>


              <div>

                <span>
                  Price per seat
                </span>

                <strong>
                  ₹{bus.price}
                </strong>

              </div>


              <div className="total-fare">

                <span>
                  Total fare
                </span>

                <strong>
                  ₹{totalFare}
                </strong>

              </div>


            </div>



            {/* CONTINUE */}

            <button
              className="continue-btn"
              onClick={handleContinue}
              disabled={
                selectedSeats.length === 0
              }
            >

              Continue

              <span>
                →
              </span>

            </button>


            <p className="seat-note">

              You can select up to 4 seats in one booking.

            </p>


          </aside>


        </div>


      </main>


    </div>

  );

}


export default SeatSelection;
