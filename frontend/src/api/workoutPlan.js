import axios from "axios";

const API_URL = "http://localhost:5000/api/workout-plan";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
// CREATE workout plan
export const createWorkoutPlan = async (userProfile) => {
  try {
    const response = await axios.post(
      `${API_URL}/create`,
      userProfile,
      getAuthHeader()
    );
    return response.data;
  } catch (err) {
    console.error("Workout plan API error:", err);
    throw err;
  }
};
