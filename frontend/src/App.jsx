import "./App.css";
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import SearchResults from "./pages/SearchResults";
import SeatSelection from "./pages/SeatSelection";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PassengerDetails from "./pages/PassengerDetails";
import Payment from "./pages/Payment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import Cancellation from "./pages/Cancellation";


/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  const navigate = useNavigate();

  const loggedIn = localStorage.getItem("busgoLoggedIn") === "true";

  const currentUser = JSON.parse(
    localStorage.getItem("busgoCurrentUser") || "null"
);

const handleLogout = () => {
  localStorage.removeItem("busgoLoggedIn");
  localStorage.removeItem("busgoCurrentUser");

  navigate("/");
};

const [journeyDate, setJourneyDate] = useState(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

const handleSearch = () => {
  navigate(
    `/search?from=Chennai&to=Bengaluru&date=${journeyDate}&passengers=1`
  );
};

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar">

        <div className="nav-container">

          {/* LOGO */}
          <div
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <span className="logo-icon">B</span>
            <span>BusGo</span>
          </div>

          {/* NAVIGATION */}
          <nav className="nav-links">

            <a href="#journey">
              Plan Your Journey
            </a>

            <a href="#manage">
              Manage Booking
            </a>

            <a href="#track">
              Track Bus
            </a>

            <a href="#help">
              Help
            </a>

          </nav>

          {loggedIn ? (
          <div className="user-menu">

            <span className="welcome-user">
              Hi, {currentUser?.fullName || "User"}
            </span>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        ) : (
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}

        </div>

      </header>


      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <main>

        <section
          className="hero"
          id="journey"
        >

          <div className="hero-content">

            {/* HERO TEXT */}

            <div className="hero-text">

              <span className="eyebrow">
                TRAVEL SMART. TRAVEL BUSGO.
              </span>

              <h1>
                Your journey starts
                <span> here.</span>
              </h1>

              <p>
                Book comfortable bus journeys across cities with easy
                seat selection, secure payments and real-time trip updates.
              </p>

            </div>


            {/* =================================================
                SEARCH CARD
            ================================================= */}

            <div className="search-card">

              {/* TRIP TYPE */}

              <div className="trip-tabs">

                <button className="active">
                  One Way
                </button>

                <button>
                  Round Trip
                </button>

              </div>


              {/* SEARCH FIELDS */}

              <div className="search-fields">

                {/* FROM */}

                <div className="field">

                  <label>
                    FROM
                  </label>

                  <div className="field-value">

                    <span className="field-icon">
                      ◉
                    </span>

                    Chennai

                  </div>

                  <small>
                    Departure city
                  </small>

                </div>


                {/* SWAP */}

                <button className="swap-btn">
                  ⇄
                </button>


                {/* TO */}

                <div className="field">

                  <label>
                    TO
                  </label>

                  <div className="field-value">

                    <span className="field-icon">
                      ●
                    </span>

                    Bengaluru

                  </div>

                  <small>
                    Destination city
                  </small>

                </div>

                {/* DATE */}

                <div className="field">

                <label>
                  DEPARTURE
                </label>

                <div className="field-value">

                  <span className="field-icon">
                    ▣
                  </span>

                  <input
                    type="date"
                    value={journeyDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(event) => setJourneyDate(event.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      font: "inherit",
                      color: "inherit",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  />

                </div>

                <small>
                  Choose your travel date
                </small>

                </div>
                                


                {/* PASSENGERS */}

                <div className="field">

                  <label>
                    PASSENGERS
                  </label>

                  <div className="field-value">

                    <span className="field-icon">
                      ♙
                    </span>

                    1 Passenger

                  </div>

                  <small>
                    Adults & children
                  </small>

                </div>


                {/* SEARCH BUTTON */}

                <button
                  className="search-btn"
                  onClick={handleSearch}
                >

                  Search buses

                  <span>
                    →
                  </span>

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            TRUST STRIP
        ===================================================== */}

        <section className="trust-strip">

          <div>

            <strong>
              ✓ Secure booking
            </strong>

            <span>
              Your payment is protected
            </span>

          </div>


          <div>

            <strong>
              ◉ Live tracking
            </strong>

            <span>
              Know where your bus is
            </span>

          </div>


          <div>

            <strong>
              ▣ Easy cancellation
            </strong>

            <span>
              Simple booking management
            </span>

          </div>


          <div>

            <strong>
              24/7 Support
            </strong>

            <span>
              We're here when you need us
            </span>

          </div>

        </section>


        {/* =====================================================
            POPULAR ROUTES
        ===================================================== */}

        <section
          className="section"
          id="routes"
        >

          <div className="section-heading">

            <div>

              <span className="section-label">
                EXPLORE ROUTES
              </span>

              <h2>
                Popular bus routes
              </h2>

            </div>

            <button className="text-btn">
              View all routes →
            </button>

          </div>


          <div className="route-grid">

            {/* ROUTE 1 */}

            <div className="route-card">

              <div className="route-top">

                <span>
                  Chennai
                </span>

                <span className="route-arrow">
                  →
                </span>

                <span>
                  Bengaluru
                </span>

              </div>

              <p>
                Multiple buses available
              </p>

              <strong>
                From ₹499
              </strong>

            </div>


            {/* ROUTE 2 */}

            <div className="route-card">

              <div className="route-top">

                <span>
                  Chennai
                </span>

                <span className="route-arrow">
                  →
                </span>

                <span>
                  Coimbatore
                </span>

              </div>

              <p>
                Comfortable overnight journeys
              </p>

              <strong>
                From ₹599
              </strong>

            </div>


            {/* ROUTE 3 */}

            <div className="route-card">

              <div className="route-top">

                <span>
                  Bengaluru
                </span>

                <span className="route-arrow">
                  →
                </span>

                <span>
                  Hyderabad
                </span>

              </div>

              <p>
                AC sleeper & semi-sleeper
              </p>

              <strong>
                From ₹799
              </strong>

            </div>


            {/* ROUTE 4 */}

            <div className="route-card">

              <div className="route-top">

                <span>
                  Chennai
                </span>

                <span className="route-arrow">
                  →
                </span>

                <span>
                  Madurai
                </span>

              </div>

              <p>
                Daily departures
              </p>

              <strong>
                From ₹449
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================================
            COMFORT SECTION
        ===================================================== */}

        <section className="comfort-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                TRAVEL WITH BUSGO
              </span>

              <h2>
                Comfort on every journey
              </h2>

            </div>

          </div>


          <div className="feature-grid">

            {/* FEATURE 1 */}

            <div className="feature-card">

              <div className="feature-icon">
                ❄
              </div>

              <h3>
                Air Conditioning
              </h3>

              <p>
                Travel comfortably with AC buses across selected routes.
              </p>

            </div>


            {/* FEATURE 2 */}

            <div className="feature-card">

              <div className="feature-icon">
                ▣
              </div>

              <h3>
                Choose Your Seat
              </h3>

              <p>
                Select your preferred window, aisle, sleeper or semi-sleeper seat.
              </p>

            </div>


            {/* FEATURE 3 */}

            <div className="feature-card">

              <div className="feature-icon">
                ⚡
              </div>

              <h3>
                Power & Connectivity
              </h3>

              <p>
                Stay connected during your journey with onboard power options.
              </p>

            </div>


            {/* FEATURE 4 */}

            <div
              className="feature-card"
              id="track"
            >

              <div className="feature-icon">
                ◉
              </div>

              <h3>
                Live Bus Tracking
              </h3>

              <p>
                Follow your journey and stay updated with real-time information.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="section">

          <div className="section-heading centered">

            <span className="section-label">
              SIMPLE BOOKING
            </span>

            <h2>
              How BusGo works
            </h2>

            <p>
              From searching for a bus to receiving your digital ticket,
              everything is designed to be simple.
            </p>

          </div>


          <div className="steps">

            {/* STEP 1 */}

            <div className="step">

              <div className="step-number">
                01
              </div>

              <h3>
                Search
              </h3>

              <p>
                Enter your route, date and number of passengers.
              </p>

            </div>


            <div className="step-line"></div>


            {/* STEP 2 */}

            <div className="step">

              <div className="step-number">
                02
              </div>

              <h3>
                Choose
              </h3>

              <p>
                Compare buses and select your preferred seat.
              </p>

            </div>


            <div className="step-line"></div>


            {/* STEP 3 */}

            <div className="step">

              <div className="step-number">
                03
              </div>

              <h3>
                Pay
              </h3>

              <p>
                Complete your booking using a secure payment method.
              </p>

            </div>


            <div className="step-line"></div>


            {/* STEP 4 */}

            <div className="step">

              <div className="step-number">
                04
              </div>

              <h3>
                Travel
              </h3>

              <p>
                Receive your digital ticket and enjoy your journey.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            MANAGE BOOKING
        ===================================================== */}

        <section
          className="manage-section"
          id="manage"
        >

          <div>

            <span className="section-label">
              YOUR TRIP
            </span>

            <h2>
              Manage your booking easily
            </h2>

            <p>
              View your booking, check trip details, manage seats and
              access your digital ticket from one place.
            </p>

          </div>


          <button className="outline-btn">
            Manage booking →
          </button>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="footer"
        id="help"
      >

        <div className="footer-container">

          {/* FOOTER BRAND */}

          <div>

            <div className="logo footer-logo">

              <span className="logo-icon">
                B
              </span>

              <span>
                BusGo
              </span>

            </div>

            <p>
              Making bus travel simple, comfortable and reliable.
            </p>

          </div>


          {/* FOOTER COLUMN 1 */}

          <div>

            <h4>
              Plan your journey
            </h4>

            <a href="#journey">
              Search buses
            </a>

            <a href="#routes">
              Popular routes
            </a>

            <a href="#track">
              Track bus
            </a>

          </div>


          {/* FOOTER COLUMN 2 */}

          <div>

            <h4>
              Support
            </h4>

            <a href="#manage">
              Manage booking
            </a>

            <a href="#help">
              Help centre
            </a>

            <a href="#help">
              Contact us
            </a>

          </div>


          {/* FOOTER COLUMN 3 */}

          <div>

            <h4>
              BusGo
            </h4>

            <a href="#about">
              About us
            </a>

            <a href="#terms">
              Terms & conditions
            </a>

            <a href="#privacy">
              Privacy policy
            </a>

          </div>

        </div>


        <div className="footer-bottom">

          © 2026 BusGo. All rights reserved.

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   MAIN APP ROUTER
========================================================= */

function App() {

  return (

    <Routes>

      {/* HOME */}

      <Route
        path="/"
        element={<Home />}
      />


      {/* SEARCH RESULTS */}

      <Route
        path="/search"
        element={<SearchResults />}
      />

      <Route
        path="/seat-selection"
        element={<SeatSelection />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/passenger-details"
        element={<PassengerDetails />}
      />

        <Route
          path="/booking-confirmation"
          element={<BookingConfirmation />}
        />

      <Route
        path="/payment"
        element={<Payment />}
      />
      <Route
        path="/my-bookings"
        element={<MyBookings />}
      />

      <Route
        path="/cancellation"
        element={<Cancellation />}
      />

    </Routes>

  );
}


export default App; 