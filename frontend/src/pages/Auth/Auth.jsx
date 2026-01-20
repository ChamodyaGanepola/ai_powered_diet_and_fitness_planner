import React, { useState, useEffect } from "react";
import "./Auth.css";
import Logo from "../../images/cover-image.png";
import { useAuth } from "../../context/authContext.jsx";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../context/alertContext.jsx";
import { FaSignInAlt, FaUserPlus, FaSpinner } from "react-icons/fa";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../../utils/validation";

const Auth = () => {
  const { signUp, logIn, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const initialState = {
    username: "",
    email: "",
    role: "user",
    password: "",
    confirmpassword: "",
  };
  const [data, setData] = useState(initialState);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPass, setConfirmPass] = useState(true);

  const resetForm = () => {
    setData(initialState);
    setConfirmPass(true);
    setError("");
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (
      !confirmPass &&
      (e.target.name === "password" || e.target.name === "confirmpassword")
    )
      setConfirmPass(true);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===== SIGNUP VALIDATION =====
    if (isSignUp) {
      if (!validateUsername(data.username)) {
        showAlert({
          type: "error",
          message:
            "Username must be at least 3 characters and contain only letters or numbers.",
          autoClose: true,
        });
        return;
      }

      if (data.email !== data.email.toLowerCase()) {
        showAlert({
          type: "error",
          message: "Email must be in lowercase only.",
          autoClose: true,
        });
        return;
      }

      if (!validatePassword(data.password)) {
        showAlert({
          type: "error",
          message:
            "Password must be at least 8 characters, include 1 uppercase letter, 1 lowercase letter, and 1 number.",
          autoClose: true,
        });
        return;
      }

      if (data.password !== data.confirmpassword) {
        setConfirmPass(false);
        showAlert({
          type: "error",
          message: "Passwords do not match.",
          autoClose: true,
        });
        return;
      }

      // If all validations passed
      setConfirmPass(true);
      const { success, message } = await signUp(data);

      if (!success) {
        showAlert({
          type: "error",
          message: message,
          autoClose: true,
        });
        return;
      }

      resetForm();
      setIsSignUp(false);
      showAlert({
        type: "success",
        message: "Registration successful. Please login.",
        autoClose: true,
      });
    } else {
      // ===== LOGIN VALIDATION =====
      if (!validateEmail(data.email)) {
        showAlert({
          type: "error",
          message: "Please enter a valid email address.",
          autoClose: true,
        });
        return;
      }

      if (!validatePassword(data.password)) {
        showAlert({
          type: "error",
          message:
            "Password must be at least 8 characters, include 1 uppercase letter, 1 lowercase letter, and 1 number.",
          autoClose: true,
        });
        return;
      }

      const success = await logIn({
        email: data.email,
        password: data.password,
      });

      if (success) {
        showAlert({
          type: "success",
          message: "Login successful!",
          autoClose: true,
        });
        navigate("/home");
      }
    }
  };

  useEffect(() => setError && setError(""), []);
  useEffect(() => {
    document.body.classList.add("authPage");
    return () => document.body.classList.remove("authPage");
  }, []);

  return (
    <div className="Auth">
      <div className="a-left">
        <img src={Logo} alt="Logo" className="logoImage" />
        <div className="welcomeText">
          <span className="helloText"> Hello </span>
          <span className="pinkChampsText">HealthPilot </span>
          <p className="description">
            Your personal AI-powered health companion.
            <br />
            Track workouts, plan meals, and stay consistent on your wellness
            journey.
          </p>
        </div>
      </div>

      <div className="a-right">
        <h1 className="pinkChampsTopic">
          SignUp to Get Started <br />
          or LogIn to Continue
        </h1>
        <form className="infoForm authForm" onSubmit={handleSubmit}>
          <h2>{isSignUp ? "Register" : "Login"}</h2>

          {isSignUp && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={data.username}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={data.email}
                onChange={handleChange}
                required
              />
              <select
                name="role"
                value={data.role}
                onChange={handleChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          {!isSignUp && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={data.email}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            required
          />
          {isSignUp && (
            <input
              type="password"
              name="confirmpassword"
              placeholder="Confirm Password"
              value={data.confirmpassword}
              onChange={handleChange}
              required
            />
          )}

          {!confirmPass && (
            <p style={{ color: "red", textAlign: "center" }}>
              *Passwords do not match
            </p>
          )}
          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spin" />
                Loading...
              </>
            ) : isSignUp ? (
              <>
                <FaUserPlus />
                Sign Up
              </>
            ) : (
              <>
                <FaSignInAlt />
                Login
              </>
            )}
          </button>

          {!isSignUp && (
            <div
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </div>
          )}
          <div
            className="toggle"
            onClick={() => {
              setIsSignUp((prev) => !prev);
              resetForm();
            }}
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign up"}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
