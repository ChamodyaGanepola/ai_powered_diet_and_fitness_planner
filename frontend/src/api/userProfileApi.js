import axios from "axios";

// Base URL
const API_URL = "http://localhost:5000/api/user-profiles";

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};


// Get user profile by user id
export const getProfileByUserId = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};

// Create new profile
export const createProfile = async (profileData) => {
  const res = await axios.post(API_URL, profileData, getAuthHeader());
  return res.data;
};

// Update profile by user id
export const updateProfile = async (id, updateData) => {
  const res = await axios.patch(`${API_URL}/${id}`, updateData, getAuthHeader());
  return res.data;
};

// Delete profile by user id
export const deleteProfile = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};
