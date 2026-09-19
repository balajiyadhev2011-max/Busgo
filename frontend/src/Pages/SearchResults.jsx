import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const busAmenities = {
  1: ["AC", "USB", "Blanket", "Live Tracking"],
  2: ["AC", "USB", "Water", "Live Tracking"],
  3: ["AC", "USB", "WiFi", "Blanket"],
  4: ["Blanket", "Water"],
};

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

const buses = [
  {
    id: 1,
    operator: "GreenLine Travels",
    rating: "4.6",
    departure: "10:30 PM",
    arrival: "05:30 AM",
    duration: "7h 00m",
    type: "AC Sleeper",
    seats: 8,
    price: 899,
    amenities: ["AC", "USB", "Blanket", "Live Tracking"],
  },
  {
    id: 2,
    operator: "South Express",
    rating: "4.4",
    departure: "09:45 PM",
    arrival: "05:15 AM",
    duration: "7h 30m",
    type: "AC Semi Sleeper",
    seats: 14,
    price: 699,
    amenities: ["AC", "USB", "Water", "Live Tracking"],
  },
  {
    id: 3,
    operator: "Royal Roadways",
    rating: "4.7",
    departure: "11:15 PM",
    arrival: "06:00 AM",
    duration: "6h 45m",
    type: "AC Sleeper",
    seats: 5,
    price: 999,
    amenities: ["AC", "USB", "WiFi", "Blanket"],
  },
  {
    id: 4,
    operator: "CityRide",
    rating: "4.3",
    departure: "08:30 PM",
    arrival: "04:30 AM",
    duration: "8h 00m",
    type: "Non AC Sleeper",
    seats: 21,
    price: 549,
    amenities: ["Blanket", "Water"],
  },
];

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const from = searchParams.get("from") || "Chennai";
  const to = searchParams.get("to") || "Bengaluru";
  const date = searchParams.get("date") || "2026-09-18";
  const passengers = searchParams.get("passengers") || "1";

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        setError("");
  
        const response = await fetch(
          `${API_BASE_URL}/api/buses`
        );
  
        if (!response.ok) {
          throw new Error(
            `Failed to fetch buses (${response.status})`
          );
        }
  
        const data = await response.json();
  
        const formattedBuses = data.map((bus) => ({
          ...bus,
          departure: formatTime(bus.departureTime),
          arrival: formatTime(bus.arrivalTime),
          type: bus.busType,
          seats: bus.availableSeats,
          amenities: busAmenities[bus.id] || [],
        }));
  
        setBuses(formattedBuses);
  
      } catch (err) {
        console.error("Bus API Error:", err);
  
        setError(
          "Unable to load buses. Please make sure the BusGo backend is running."
        );
      } finally {
        setLoading(false);
      }
    };
  
    fetchBuses();
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleSeatSelection = (bus) => {
    navigate(`/seat-selection?busId=${bus.id}`);
  };

  return (
    <div className="search-page">

      {/* HEADER */}
      <header className="search-header">
        <div
          className="search-logo"
          onClick={() => navigate("/")}
        >
          <span className="logo-icon">B</span>
          <span>BusGo</span>
        </div>

        <div className="search-header-links">
          <span>Manage Booking</span>
          <span>Track Bus</span>
          <span>Help</span>
        </div>

        <button className="login-btn">
          Login
        </button>
      </header>

      {/* SEARCH SUMMARY */}
      <section className="search-summary">

        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <div className="journey-summary">

          <div>
            <span>FROM</span>
            <strong>{from}</strong>
          </div>

          <div className="journey-line">
            ───────── →
          </div>

          <div>
            <span>TO</span>
            <strong>{to}</strong>
          </div>

          <div className="summary-divider"></div>

          <div>
            <span>DATE</span>
            <strong>{formattedDate}</strong>
          </div>

          <div>
            <span>PASSENGERS</span>
            <strong>{passengers}</strong>
          </div>

          <button
            className="modify-btn"
            onClick={() => navigate("/")}
          >
            Modify Search
          </button>

        </div>
      </section>

      {/* MAIN */}
      <main className="results-container">

        {/* TITLE */}
        <div className="results-title">
          <div>
            <span className="section-label">
              BUS RESULTS
            </span>

            <h1>
              {from} → {to}
            </h1>

            <p>
            {loading
              ? "Loading buses..."
              : `${buses.length} buses available for your journey`}
            </p>
          </div>

          <select className="sort-select">
            <option>Recommended</option>
            <option>Lowest Price</option>
            <option>Earliest Departure</option>
            <option>Highest Rated</option>
          </select>
        </div>

        <div className="results-layout">

          {/* FILTERS */}
          <aside className="filters">

            <h3>Filter buses</h3>

            <div className="filter-group">
              <h4>Bus Type</h4>

              <label>
                <input type="checkbox" />
                AC
              </label>

              <label>
                <input type="checkbox" />
                Non AC
              </label>

              <label>
                <input type="checkbox" />
                Sleeper
              </label>

              <label>
                <input type="checkbox" />
                Semi Sleeper
              </label>
            </div>

            <div className="filter-group">
              <h4>Departure Time</h4>

              <label>
                <input type="checkbox" />
                Before 6 AM
              </label>

              <label>
                <input type="checkbox" />
                6 AM - 12 PM
              </label>

              <label>
                <input type="checkbox" />
                12 PM - 6 PM
              </label>

              <label>
                <input type="checkbox" />
                After 6 PM
              </label>
            </div>

            <div className="filter-group">
              <h4>Amenities</h4>

              <label>
                <input type="checkbox" />
                USB Charging
              </label>

              <label>
                <input type="checkbox" />
                WiFi
              </label>

              <label>
                <input type="checkbox" />
                Live Tracking
              </label>
            </div>

          </aside>

          {/* BUS LIST */}
          <section className="bus-list">

            {buses.map((bus) => (

              <article
                className="bus-card"
                key={bus.id}
              >

                <div className="bus-main">

                  <div className="bus-operator">

                    <div className="operator-logo">
                      {bus.operator.charAt(0)}
                    </div>

                    <div>
                      <h3>{bus.operator}</h3>

                      <div className="rating">
                        ★ {bus.rating}
                      </div>
                    </div>

                  </div>

                  <div className="bus-timing">

                    <div>
                      <strong>{bus.departure}</strong>
                      <span>{from}</span>
                    </div>

                    <div className="duration">
                      <span>{bus.duration}</span>
                      <div></div>
                    </div>

                    <div>
                      <strong>{bus.arrival}</strong>
                      <span>{to}</span>
                    </div>

                  </div>

                  <div className="bus-price">

                    <span>Starting from</span>

                    <strong>
                      ₹{bus.price}
                    </strong>

                    <small>
                      per passenger
                    </small>

                  </div>

                </div>

                <div className="bus-details">

                  <div className="bus-type">
                    {bus.type}
                  </div>

                  <div className="amenities">

                    {bus.amenities.map((item) => (
                      <span key={item}>
                        ✓ {item}
                      </span>
                    ))}

                  </div>

                  <div className="seat-info">
                    <strong>
                      {bus.seats} seats
                    </strong>

                    <span>
                      available
                    </span>
                  </div>

                  <button
                    className="select-seat-btn"
                    onClick={() => handleSeatSelection(bus)}
                  >
                    Select Seat →
                  </button>

                </div>

              </article>

            ))}

          </section>

        </div>

      </main>

    </div>
  );
}

export default SearchResults;
