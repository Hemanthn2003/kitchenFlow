import { useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FaUtensils,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import "./Login.css";


const API_URL = "http://localhost:5000/api/auth";


function Login() {

  /* Page Mode */

  const [mode, setMode] =
    useState("login");


  /* Redirect */

  const [redirectTo, setRedirectTo] =
    useState(null);


  /* Login */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);


  /* Password Reset */

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  /* OTP */

  const [otp, setOtp] =
    useState("");


  /* General */

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("error");


  /* Login */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");

    setLoading(true);


    try {

      console.log(
        "SIGN IN BUTTON CLICKED"
      );


      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email:
              email.trim().toLowerCase(),

            password,

            rememberMe,
          }),
        }
      );


      console.log(
        "Login response status:",
        response.status
      );


      const data =
        await response.json();


      console.log(
        "Login response:",
        data
      );


      /* Login Failed */

      if (!response.ok) {

        setMessage(
          data.message ||
          "Invalid email or password"
        );

        setMessageType(
          "error"
        );

        return;
      }


      /* Check User */

      if (!data.user) {

        console.error(
          "No user returned by backend"
        );

        setMessage(
          "Login successful, but user information was not returned"
        );

        setMessageType(
          "error"
        );

        return;
      }


      /* Get Role */

      const role =
        String(
          data.user.role || ""
        )
          .trim()
          .toUpperCase();


      console.log(
        "Logged-in user:",
        data.user
      );

      console.log(
        "User role:",
        role
      );


      /* Validate Role */

      const validRoles = [
        "ADMIN",
        "MANAGER",
        "KITCHEN",
        "WAITER",
      ];


      if (
        !validRoles.includes(role)
      ) {

        console.error(
          "Invalid role:",
          role
        );

        setMessage(
          `Invalid user role: ${role}`
        );

        setMessageType(
          "error"
        );

        return;
      }


      /* Save User */

      const loggedInUser = {
        ...data.user,
        role,
      };


      localStorage.setItem(
        "kitchenFlowUser",
        JSON.stringify(
          loggedInUser
        )
      );


      console.log(
        "User saved successfully"
      );


      /* Success Message */

      setMessage(
        "Login successful"
      );

      setMessageType(
        "success"
      );


      /*
        Set destination.

        Navigate component will
        automatically redirect.
      */

      if (role === "ADMIN") {

        setRedirectTo(
          "/admin"
        );

      }

      else if (role === "MANAGER") {

        setRedirectTo(
          "/manager"
        );

      }

      else if (role === "KITCHEN") {

        setRedirectTo(
          "/kitchen"
        );

      }

      else if (role === "WAITER") {

        setRedirectTo(
          "/waiter"
        );

      }


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      setMessage(
        "Unable to connect to server"
      );

      setMessageType(
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  /* Forgot Password */

  const handleForgotPassword = () => {

    setMode("forgot");

    setMessage("");

    setOtp("");

    setPassword("");

    setConfirmPassword("");

  };


  /* Send OTP */

  const handleSendOTP = async () => {

    if (!email.trim()) {

      setMessage(
        "Enter your email address"
      );

      setMessageType(
        "error"
      );

      return;
    }


    setMessage("");

    setLoading(true);


    try {

      console.log(
        "Requesting OTP..."
      );


      const response = await fetch(
        `${API_URL}/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim().toLowerCase(),
          }),
        }
      );


      const data =
        await response.json();


      console.log(
        "Forgot password response:",
        data
      );


      if (!response.ok) {

        setMessage(
          data.message ||
          "Unable to send OTP"
        );

        setMessageType(
          "error"
        );

        return;
      }


      setOtp("");

      setMessage(
        "OTP sent successfully to your email"
      );

      setMessageType(
        "success"
      );


      setMode("otp");


    } catch (error) {

      console.error(
        "OTP error:",
        error
      );


      setMessage(
        "Unable to connect to server"
      );

      setMessageType(
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  /* Verify OTP */

  const handleVerifyOTP = async () => {

    if (!otp.trim()) {

      setMessage(
        "Enter the OTP"
      );

      setMessageType(
        "error"
      );

      return;
    }


    if (otp.length !== 6) {

      setMessage(
        "Enter the 6-digit OTP"
      );

      setMessageType(
        "error"
      );

      return;
    }


    setMessage("");

    setLoading(true);


    try {

      console.log(
        "Verifying OTP..."
      );


      const response = await fetch(
        `${API_URL}/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim().toLowerCase(),

            otp,
          }),
        }
      );


      const data =
        await response.json();


      console.log(
        "OTP response:",
        data
      );


      if (!response.ok) {

        setMessage(
          data.message ||
          "Enter the correct OTP"
        );

        setMessageType(
          "error"
        );

        return;
      }


      setMessage(
        "OTP verified successfully"
      );

      setMessageType(
        "success"
      );


      setPassword("");

      setConfirmPassword("");

      setShowPassword(false);

      setShowConfirmPassword(false);

      setMode("reset");


    } catch (error) {

      console.error(
        "OTP verification error:",
        error
      );


      setMessage(
        "Unable to connect to server"
      );

      setMessageType(
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  /* Reset Password */

  const handleResetPassword = async () => {

    if (!password) {

      setMessage(
        "Enter a new password"
      );

      setMessageType(
        "error"
      );

      return;
    }


    if (password.length < 8) {

      setMessage(
        "Password must contain at least 8 characters"
      );

      setMessageType(
        "error"
      );

      return;
    }


    if (!confirmPassword) {

      setMessage(
        "Re-enter your new password"
      );

      setMessageType(
        "error"
      );

      return;
    }


    if (
      password !== confirmPassword
    ) {

      setMessage(
        "Passwords do not match"
      );

      setMessageType(
        "error"
      );

      return;
    }


    setMessage("");

    setLoading(true);


    try {

      console.log(
        "Resetting password..."
      );


      const response = await fetch(
        `${API_URL}/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            email:
              email.trim().toLowerCase(),

            newPassword:
              password,

            confirmPassword,

          }),
        }
      );


      const data =
        await response.json();


      console.log(
        "Reset password response:",
        data
      );


      if (!response.ok) {

        setMessage(
          data.message ||
          "Unable to update password"
        );

        setMessageType(
          "error"
        );

        return;
      }


      setMessage(
        "Password updated successfully"
      );

      setMessageType(
        "success"
      );


      setPassword("");

      setConfirmPassword("");

      setOtp("");


      setTimeout(() => {

        setMode("login");

        setMessage("");

      }, 1500);


    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );


      setMessage(
        "Unable to connect to server"
      );

      setMessageType(
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  /* Back To Login */

  const backToLogin = () => {

    setMode("login");

    setOtp("");

    setPassword("");

    setConfirmPassword("");

    setMessage("");

    setShowPassword(false);

    setShowConfirmPassword(false);

  };


  /*
    Redirect after successful login.

    This replaces useNavigate().
  */

  if (redirectTo) {

    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );

  }


  return (

    <main className="login-page">

      <section className="login-container">


        {/* Left Brand Section */}

        <div className="login-brand">

          <div className="brand-content">

            <div className="brand-icon">

              <FaUtensils />

            </div>


            <h1>

              Kitchen
              <span>
                Flow
              </span>

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


        {/* Right Login Section */}

        <div className="login-form-section">


          {/* Mobile Logo */}

          <div className="mobile-logo">

            <div className="mobile-logo-icon">

              <FaUtensils />

            </div>


            <span>

              Kitchen
              <span>
                Flow
              </span>

            </span>

          </div>


          <div className="login-form-container">


            {/* LOGIN */}

            {mode === "login" && (

              <>

                <div className="form-header">

                  <p className="welcome-label">

                    WELCOME BACK

                  </p>


                  <h2>

                    Sign in to your account

                  </h2>


                  <p className="form-description">

                    Enter your credentials to
                    access KitchenFlow.

                  </p>

                </div>


                <form
                  onSubmit={handleSubmit}
                >


                  {/* Email */}

                  <div className="input-group">

                    <div className="input-wrapper">

                      <FaEnvelope
                        className="input-icon"
                      />


                      <input
                        id="email"

                        type="email"

                        placeholder="Enter Your Email"

                        value={email}

                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }

                        autoComplete="email"

                        required
                      />

                    </div>

                  </div>


                  {/* Password */}

                  <div className="input-group">

                    <div className="input-wrapper">

                      <FaLock
                        className="input-icon"
                      />


                      <input
                        id="password"

                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }

                        placeholder="Enter Your Password"

                        value={password}

                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }

                        autoComplete="current-password"

                        required
                      />


                      <button
                        type="button"

                        className="password-toggle"

                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
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

                      <input
                        type="checkbox"

                        checked={
                          rememberMe
                        }

                        onChange={(e) =>
                          setRememberMe(
                            e.target.checked
                          )
                        }
                      />


                      <span>
                        Remember me
                      </span>

                    </label>


                    <button
                      type="button"

                      className="forgot-password"

                      onClick={
                        handleForgotPassword
                      }
                    >

                      Forgot Password?

                    </button>

                  </div>


                  {/* Message */}

                  {message && (

                    <p
                      className={`auth-message ${messageType}`}
                    >

                      {message}

                    </p>

                  )}


                  {/* Sign In */}

                  <button
                    type="submit"

                    className="login-button"

                    disabled={loading}
                  >

                    {loading
                      ? "Signing In..."
                      : "Sign In"}

                  </button>

                </form>

              </>

            )}


            {/* FORGOT PASSWORD */}

            {mode === "forgot" && (

              <>

                <div className="form-header">

                  <p className="welcome-label">

                    ACCOUNT RECOVERY

                  </p>


                  <h2>

                    Recover your account

                  </h2>


                  <p className="form-description">

                    Enter your registered email
                    address to receive an OTP.

                  </p>

                </div>


                <div className="input-group">

                  <div className="input-wrapper">

                    <FaEnvelope
                      className="input-icon"
                    />


                    <input
                      type="email"

                      placeholder="Enter Your Email"

                      value={email}

                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }

                      autoComplete="email"

                      required
                    />

                  </div>

                </div>


                {message && (

                  <p
                    className={`auth-message ${messageType}`}
                  >

                    {message}

                  </p>

                )}


                <button
                  type="button"

                  className="login-button"

                  onClick={
                    handleSendOTP
                  }

                  disabled={loading}
                >

                  {loading
                    ? "Sending OTP..."
                    : "Get OTP"}

                </button>


                <button
                  type="button"

                  className="back-login"

                  onClick={
                    backToLogin
                  }
                >

                  Back to Sign In

                </button>

              </>

            )}


            {/* OTP */}

            {mode === "otp" && (

              <>

                <div className="form-header">

                  <p className="welcome-label">

                    VERIFY OTP

                  </p>


                  <h2>

                    Enter your OTP

                  </h2>


                  <p className="form-description">

                    We sent a 6-digit OTP to:

                    <br />

                    <strong>
                      {email}
                    </strong>

                  </p>

                </div>


                <div className="input-group">

                  <div className="input-wrapper">

                    <input
                      className="otp-input"

                      type="text"

                      inputMode="numeric"

                      maxLength={6}

                      placeholder="Enter 6-digit OTP"

                      value={otp}

                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }

                      autoComplete="one-time-code"

                    />

                  </div>

                </div>


                {message && (

                  <p
                    className={`auth-message ${messageType}`}
                  >

                    {message}

                  </p>

                )}


                <button
                  type="button"

                  className="login-button"

                  onClick={
                    handleVerifyOTP
                  }

                  disabled={loading}
                >

                  {loading
                    ? "Verifying..."
                    : "Verify OTP"}

                </button>


                <button
                  type="button"

                  className="back-login"

                  onClick={
                    backToLogin
                  }
                >

                  Back to Sign In

                </button>

              </>

            )}


            {/* RESET PASSWORD */}

            {mode === "reset" && (

              <>

                <div className="form-header">

                  <p className="welcome-label">

                    RESET PASSWORD

                  </p>


                  <h2>

                    Create a new password

                  </h2>


                  <p className="form-description">

                    OTP verified successfully.
                    Create your new password.

                  </p>

                </div>


                {/* New Password */}

                <div className="input-group">

                  <div className="input-wrapper">

                    <FaLock
                      className="input-icon"
                    />


                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }

                      placeholder="Enter New Password"

                      value={password}

                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }

                      autoComplete="new-password"

                      minLength={8}

                    />


                    <button
                      type="button"

                      className="password-toggle"

                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
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


                {/* Confirm Password */}

                <div className="input-group">

                  <div className="input-wrapper">

                    <FaLock
                      className="input-icon"
                    />


                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }

                      placeholder="Re-enter New Password"

                      value={
                        confirmPassword
                      }

                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }

                      autoComplete="new-password"

                      minLength={8}

                    />


                    <button
                      type="button"

                      className="password-toggle"

                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }

                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showConfirmPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}

                    </button>

                  </div>

                </div>


                {/* Message */}

                {message && (

                  <p
                    className={`auth-message ${messageType}`}
                  >

                    {message}

                  </p>

                )}


                {/* Update Password */}

                <button
                  type="button"

                  className="login-button"

                  onClick={
                    handleResetPassword
                  }

                  disabled={loading}
                >

                  {loading
                    ? "Updating Password..."
                    : "Update Password"}

                </button>

              </>

            )}

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