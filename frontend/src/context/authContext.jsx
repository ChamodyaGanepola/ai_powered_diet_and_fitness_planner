import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // LOGIN
  const logIn = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await loginUser(data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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

const logOut = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);
};


  return (
    <AuthContext.Provider value={{ user, loading, error, setError, logIn, signUp, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
