import axios from "axios";

const API_URL = "http://localhost:5000/api/daily-progress";

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create or save daily progress
export const createDailyProgress = async (user_id, date, meals = [], workouts = []) => {
  try {
    const response = await axios.post(
      `${API_URL}/daily`,
      { user_id, date, meals, workouts },
      getAuthHeader()
    );
    return response.data;
  } catch (err) {
    console.error("Daily Progress API error:", err.response?.data || err.message);
    throw err;
  }
};



// Get daily progress for a specific date
export const getDailyProgressByDate = async (user_id, date) => {
  try {
    const res = await axios.get(`${API_URL}/daily`, {
      params: { user_id, date },
      ...getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Daily Progress by Date API error:", err.response?.data || err.message);
    throw err;
  }
};
