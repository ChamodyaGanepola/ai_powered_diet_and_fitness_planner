import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import "./Header.css";

const Header = () => {
  const [open, setOpen] = useState(false);
  const { logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();
    navigate("/");
    setOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          HealthPilot
        </div>

        {/* Desktop Nav */}
        <nav className="nav-links">
          <span onClick={() => navigate("/home")}>Home</span>
          <span onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span onClick={() => navigate("/dietplan")}>Diet Plan</span>
          <span onClick={() => navigate("/workouts")}>Workouts</span>
          <span onClick={() => navigate("/progress")}>Progress</span>
          <span onClick={() => navigate("/profile")}>Profile</span>
          <span onClick={handleLogout}>Logout</span>
        </nav>

        {/* Mobile Menu Icon */}
        <div className="menu-icon" onClick={() => setOpen(true)}>
          ☰
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`side-navbar ${open ? "open" : ""}`}>
        <div className="close-btn" onClick={() => setOpen(false)}>
          ✕
        </div>

        <span onClick={() => { navigate("/home"); setOpen(false); }}>Home</span>
        <span onClick={() => { navigate("/dashboard"); setOpen(false); }}>Dashboard</span>
        <span onClick={() => { navigate("/dietplan"); setOpen(false); }}>Diet Plan</span>
        <span onClick={() => { navigate("/workouts"); setOpen(false); }}>Workouts</span>
        <span onClick={() => { navigate("/progress"); setOpen(false); }}>Progress</span>
        <span onClick={() => { navigate("/profile"); setOpen(false); }}>Profile</span>
        <span onClick={handleLogout}>Logout</span>
      </div>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}
    </>
  );
};

export default Header;
