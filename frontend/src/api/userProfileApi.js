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
export const getProfileByUserId = async () => {
  try {
    const res = await axios.get(API_URL, getAuthHeader());
    return res.data;
  } catch (err) {
    // profile does not exist
    if (err.response?.status === 404) {
      return null;
    }
    //  real error
    throw err;
  }
};

// Create new profile
export const createProfile = async (profileData) => {
  const res = await axios.post(API_URL, profileData, getAuthHeader());
  return res.data;
};

// Update profile by user id
export const updateProfile = async (updateData) => {
  const res = await axios.patch(`${API_URL}`, updateData, getAuthHeader());
  return res.data;
};

// Delete profile by user id
export const deleteProfile = async () => {
  const res = await axios.delete(`${API_URL}`, getAuthHeader());
  return res.data;
};
