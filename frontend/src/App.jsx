import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Auth from "./pages/Auth/Auth.jsx";
import Home from "./pages/Home/Home.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import DietPlan from "./pages/DietPlan/DietPlan.jsx";
import Progress from "./pages/Progress/Progress.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Workouts from "./pages/Workouts/Workouts.jsx";
import ForgotPassword from "./component/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword/ResetPassword.jsx";
import { useAuth } from "./context/authContext.jsx";


function App() {
  const { user } = useAuth(); // ✅ reactive

  return (
    <Routes>
      {/* AUTH PAGE */}
      <Route
        path="/"
        element={user ? <Navigate to="/home" replace /> : <Auth />}
      />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/home" replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password/:token"
        element={user ? <Navigate to="/home" replace /> : <ResetPassword />}
      />

      {/* HOME */}
      <Route
        path="/home"
        element={user ? <Home /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={user ? <Profile /> : <Navigate to="/" replace />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/" replace />}
      />
      <Route
        path="/dietplan"
        element={user ? <DietPlan /> : <Navigate to="/" replace />}
      />
      <Route
        path="/workouts"
        element={user ? <Workouts /> : <Navigate to="/" replace />}
      />
      <Route
        path="/progress"
        element={user ? <Progress /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}


export default App;
