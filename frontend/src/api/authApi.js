import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// REGISTER (NO TOKEN)
export const registerUser = (data) => {
  return API.post("/users", data);
};

// LOGIN (NO TOKEN)
export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPassword = (token, data) =>
  API.patch(`/auth/reset-password/${token}`, data);
