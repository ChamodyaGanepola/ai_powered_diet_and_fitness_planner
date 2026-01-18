import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NEW: trigger to refresh profile data
  const [profileUpdated, setProfileUpdated] = useState(0);
  const markProfileUpdated = () => setProfileUpdated(prev => prev + 1);

  // LOGOUT
  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // AUTO LOGOUT WHEN TOKEN EXPIRES
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const expiry = decoded.exp * 1000; // convert to ms
      const now = Date.now();
      const delay = expiry - now;

      if (delay <= 0) {
        logOut();
        return;
      }

      const timer = setTimeout(() => {
        logOut();
      }, delay);

      return () => clearTimeout(timer);
    } catch (err) {
      // if token is invalid, logout immediately
      logOut();
    }
  }, [user]);

  // LOGIN
  const logIn = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const res = await loginUser(data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const signUp = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await registerUser(data);
      alert("Registration successful. Please login.");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        logIn,
        signUp,
        logOut,
        profileUpdated,
        markProfileUpdated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
