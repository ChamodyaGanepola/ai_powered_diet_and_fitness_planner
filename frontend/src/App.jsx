import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth/Auth.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import { useAuth } from "./context/authContext.jsx";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/chat" /> : <Auth />}
      />
      <Route
        path="/chat"
        element={user ? <Chat /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
