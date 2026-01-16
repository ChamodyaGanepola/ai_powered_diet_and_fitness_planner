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

// ---------------- GET LATEST workout plan ----------------
export const getLatestWorkoutPlan = async (userId) => {
  const res = await axios.get(`${API_URL}/latest`, {
    params: { user_id: userId },
  });
  return res.data;
};
// ---------------- GET exercises by date ----------------
export const getExercisesByDate = async (userId, date) => {
  try {
    const res = await axios.get(`${API_URL}/exercises-by-date`, {
      params: { userId, date },
      ...getAuthHeader(),
    });
    return res.data; // { exercises: [...], dayOfWeek: "Monday" }
  } catch (err) {
    console.error("Error fetching exercises by date:", err);
    throw err;
  }
};

export const updateWorkoutPlanStatus = async (workoutPlanId, status) => {
  try {
    const res = await axios.put(
      `${API_URL}/status/${workoutPlanId}`,
      { status },
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("Update Workout Plan Status Error:", err);
    throw err;
  }
};