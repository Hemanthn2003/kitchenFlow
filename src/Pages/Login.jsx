import { useState } from "react";
import {
  FaUtensils,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login submitted");
    console.log("Email:", email);
    console.log("Password:", password);

    // Backend authentication will be connected here later
  };

  return (
    <main className="login-page">
      <section className="login-container">

        {/* ==============================
            LEFT BRAND SECTION
        ============================== */}
        <div className="login-brand">

          <div className="brand-content">

            <div className="brand-icon">
              <FaUtensils />
            </div>

            <h1>
              Kitchen<span>Flow</span>
            </h1>

            <p className="brand-description">
              Smart kitchen management
              <br />
              for modern restaurants.
            </p>

            <div className="brand-line"></div>

            <p className="brand-tagline">
              Manage orders.
              <br />
              Coordinate staff.
              <br />
              Serve better.
            </p>

          </div>

          <div className="brand-bottom">
            KitchenFlow Management System
          </div>

        </div>

        {/* ==============================
            RIGHT LOGIN SECTION
        ============================== */}
        <div className="login-form-section">

          {/* Mobile Logo */}
          <div className="mobile-logo">
            <div className="mobile-logo-icon">
              <FaUtensils />
            </div>

            <span>
              Kitchen<span>Flow</span>
            </span>
          </div>

          <div className="login-form-container">

            <div className="form-header">
              <p className="welcome-label">
                WELCOME BACK
              </p>

              <h2>
                Sign in to your account
              </h2>

              <p className="form-description">
                Enter your credentials to access KitchenFlow.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="input-group">
                <div className="input-wrapper">

                  <FaEnvelope className="input-icon" />

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* Password */}
              <div className="input-group">

                <div className="input-wrapper">

                  <FaLock className="input-icon" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

              </div>

              {/* Options */}
              <div className="form-options">

                <label className="remember-me">

                  <input type="checkbox" />

                  <span>
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot Password?
                </button>

              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="login-button"
              >
                Sign In
              </button>

            </form>

          </div>

          {/* Footer */}
          <div className="login-footer">
            © {new Date().getFullYear()} Hemanth N.
            All rights reserved.
          </div>

        </div>

      </section>
    </main>
  );
}

export default Login;