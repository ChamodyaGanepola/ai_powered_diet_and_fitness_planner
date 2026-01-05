import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth/Auth.jsx";
import Home from "./pages/Home/Home.jsx";
import { useAuth } from "./context/authContext.jsx";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/home" /> : <Auth />}
      />
      <Route
        path="/home"
        element={user ? <Home /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
