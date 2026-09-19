import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      fullName,
      email,
      mobile,
      password,
      confirmPassword,
    } = formData;

    // --------------------------------------------------------
    // Frontend validation
    // --------------------------------------------------------

    if (
      !fullName ||
      !email ||
      !mobile ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // --------------------------------------------------------
    // Start API request
    // --------------------------------------------------------

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/register?full_name=${encodeURIComponent(
          fullName
        )}&email=${encodeURIComponent(
          email
        )}&mobile=${encodeURIComponent(
          mobile
        )}&password=${encodeURIComponent(password)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      // ------------------------------------------------------
      // Backend error
      // ------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed. Please try again."
        );
      }

      // ------------------------------------------------------
      // Registration success
      // ------------------------------------------------------

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      // IMPORTANT:
      // Do NOT store password in localStorage.

      setFormData({
        fullName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.message ||
          "Unable to connect to BusGo server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* HEADER */}

      <header className="auth-header">

        <div
          className="auth-logo"
          onClick={() => navigate("/")}
        >
          <span className="logo-icon">B</span>
          <span>BusGo</span>
        </div>

        <div className="auth-header-text">
          Already have an account?
          <button onClick={() => navigate("/login")}>
            Login
          </button>
        </div>

      </header>


      {/* CONTENT */}

      <main className="auth-container">

        <div className="auth-card">

          <div className="auth-heading">

            <span className="section-label">
              JOIN BUSGO
            </span>

            <h1>
              Create your account
            </h1>

            <p>
              Register once and manage all your bus journeys
              from one place.
            </p>

          </div>


          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}

            <div className="auth-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />

            </div>


            {/* EMAIL */}

            <div className="auth-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />

            </div>


            {/* MOBILE */}

            <div className="auth-field">

              <label>
                Mobile Number
              </label>

              <div className="mobile-input">

                <span>
                  +91
                </span>

                <input
                  type="tel"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>


            {/* PASSWORD ROW */}

            <div className="auth-two-column">

              <div className="auth-field">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>


              <div className="auth-field">

                <label>
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="auth-message error">
                {error}
              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="auth-message success">
                {success}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}

              {!loading && <span>→</span>}
            </button>


            <p className="auth-terms">
              By creating an account, you agree to BusGo's
              Terms & Conditions and Privacy Policy.
            </p>

          </form>


          {/* LOGIN */}

          <div className="auth-footer">

            Already have a BusGo account?

            <button
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Register;
