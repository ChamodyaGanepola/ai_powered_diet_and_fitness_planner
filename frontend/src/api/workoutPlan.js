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

export const createWorkoutPlan = async () => {
  try {
    const res = await axios.post(
      `${API_URL}/create`,
      {},                 
      getAuthHeader()     
    );
    return res.data;
  } catch (err) {
    console.error("Workout plan API error:", err);
    throw err;
  }
};

// ---------------- GET LATEST workout plan ----------------
export const getLatestWorkoutPlan = async () => {
  const res = await axios.get(`${API_URL}/latest`, {
    ...getAuthHeader(),
  });
  return res.data;
};

export const getWorkoutPlanDetails = async () => {
  const res = await axios.get(`${API_URL}/latest-workoutPlan`, {
    ...getAuthHeader(),
  });
  return res.data;
};
export const getCompletedWorkoutPlans = async () => {
  const res = await axios.get(`${API_URL}/completed`, {
    ...getAuthHeader(),
  });
  return res.data;
};

// ---------------- GET exercises by date ----------------
export const getExercisesByDate = async (date) => {
  try {
    const res = await axios.get(`${API_URL}/exercises-by-date`, {
      params: { date },
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