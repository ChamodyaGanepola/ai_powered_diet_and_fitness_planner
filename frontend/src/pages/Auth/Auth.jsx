import React, { useState, useEffect } from "react";
import "./Auth.css";
import Logo from "../../images/cover-image.png";
import { useAuth } from "../../context/authContext.jsx";

const Auth = () => {
  const { signUp, logIn, loading, error, setError } = useAuth();

  const initialState = { username: "", email: "", role: "user", password: "", confirmpassword: "" };
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
    if (!confirmPass && (e.target.name === "password" || e.target.name === "confirmpassword")) setConfirmPass(true);
    if (error) setError("");
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSignUp) {
    if (data.password === data.confirmpassword) {
      setConfirmPass(true);

      const email = data.email; // keep email for login UX
      await signUp(data);

      resetForm();
      setIsSignUp(false);       // 👉 switch to LOGIN automatically
      setData((prev) => ({ ...prev, email })); // optional
    } else {
      setConfirmPass(false);
    }
  } else {
    await logIn({ email: data.email, password: data.password });
    resetForm();
  }
};


  useEffect(() => setError && setError(""), []);

  return (
    <div className="Auth">
      <div className="a-left">
        <img src={Logo} alt="Logo" className="logoImage" />
        <div className="welcomeText">
          <span className="helloText">Hello</span>
          <span className="pinkChampsText">HealthPilot 👋</span>
          <p className="description">
        
            Welcome to HealthPilot – AI guides your health journey. <br/>First,
            create an account or log in to your existing account.
          
          </p>
        </div>
        <div className="copyright">© {new Date().getFullYear()} HealthPilot. All rights reserved.</div>
      </div>

      <div className="a-right">
        <h1 className="pinkChampsTopic">HealthPilot</h1>
        <form className="infoForm authForm" onSubmit={handleSubmit}>
          <h2>{isSignUp ? "Register" : "Login"}</h2>

          {isSignUp && <>
            <input type="text" name="username" placeholder="Username" value={data.username} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={data.email} onChange={handleChange} required />
            <select name="role" value={data.role} onChange={handleChange} required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </>}

          {!isSignUp && <input type="email" name="email" placeholder="Email" value={data.email} onChange={handleChange} required />}

          <input type="password" name="password" placeholder="Password" value={data.password} onChange={handleChange} required />
          {isSignUp && <input type="password" name="confirmpassword" placeholder="Confirm Password" value={data.confirmpassword} onChange={handleChange} required />}

          {!confirmPass && <p style={{ color: "red", textAlign: "center" }}>*Passwords do not match</p>}
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

          <button type="submit" disabled={loading}>{loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}</button>

          <div className="toggle" onClick={() => { setIsSignUp(prev => !prev); resetForm(); }}>
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
