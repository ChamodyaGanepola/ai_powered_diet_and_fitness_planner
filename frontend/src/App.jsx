import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth/Auth.jsx";
import Home from "./pages/Home/Home.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import { useAuth } from "./context/authContext.jsx";

function App() {
  const { user } = useAuth();
  const token = localStorage.getItem("token"); // 🔑 token check

  return (
    <Routes>
      {/* AUTH PAGE */}
      <Route
        path="/"
        element={token ? <Navigate to="/home" replace /> : <Auth />}
      />

      {/* HOME */}
      <Route
        path="/home"
        element={token ? <Home /> : <Navigate to="/" replace />}
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={token ? <Profile /> : <Navigate to="/" replace />}
      />

      {/* CATCH ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
