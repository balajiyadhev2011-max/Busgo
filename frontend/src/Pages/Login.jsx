import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
  
    setError("");
    setLoading(true);
  
    try {
      const loginUrl =
        `${API_BASE_URL}/api/users/login` +
        `?email=${encodeURIComponent(email.trim())}` +
        `&password=${encodeURIComponent(password)}`;
  
      
  
      const response = await fetch(loginUrl, {
        method: "POST",
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.detail || "Invalid email or password.");
        return;
      }
  
      if (data.success && data.user) {
        localStorage.setItem("busgoLoggedIn", "true");
  
        localStorage.setItem(
          "busgoCurrentUser",
          JSON.stringify({
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            mobile: data.user.mobile,
          })
        );
  
        navigate("/");
        return;
      }
  
      setError("Login failed. Unexpected server response.");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("Unable to connect to BusGo server.");
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

          Don't have an account?

          <button
            onClick={() => navigate("/register")}
          >
            Register
          </button>

        </div>

      </header>


      {/* CONTENT */}

      <main className="auth-container">

        <div className="auth-card login-card">

          <div className="auth-heading">

            <span className="section-label">
              WELCOME BACK
            </span>

            <h1>
              Login to BusGo
            </h1>

            <p>
              Access your bookings, tickets and travel
              information.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="auth-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                disabled={loading}
              />

            </div>


            {/* PASSWORD */}

            <div className="auth-field">

              <div className="password-label">

                <label>
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-btn"
                >
                  Forgot password?
                </button>

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                disabled={loading}
              />

            </div>


            {/* ERROR */}

            {error && (
              <div className="auth-message error">
                {error}
              </div>
            )}


            {/* LOGIN */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}

              {!loading && <span>→</span>}
            </button>

          </form>


          {/* REGISTER */}

          <div className="auth-footer">

            Don't have a BusGo account?

            <button
              onClick={() => navigate("/register")}
            >
              Create account
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Login;