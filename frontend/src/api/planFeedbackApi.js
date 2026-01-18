import axios from "axios";

const API_URL = "http://localhost:5000/api/plan-feedback";

/* ---------------------------
   AUTH HEADER
---------------------------- */
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/* ---------------------------
   SUBMIT PLAN FEEDBACK
   payload = {
     user_id,
     userProfileId,
     planType: "meal" | "workout",
     mealPlan_id?, // if meal
     workoutPlan_id?, // if workout
     reason
   }
---------------------------- */
export const submitPlanFeedback = async (payload) => {
  try {
    const res = await axios.post(`${API_URL}/save`, payload, getAuthHeader());
    console.log("Submit Feedback Response:", res.data);
    return res.data;
    
  } catch (err) {
    console.error("Submit Feedback Error:", err.response?.data || err.message);
    throw new Error("Failed to submit plan feedback");
  }
};
// All feedback (meal + workout)
export const getAllFeedback = async (user_id, userProfile_id) => {
  const res = await axios.get(`${API_URL}/all`, {
    params: { user_id, userProfile_id },
    ...getAuthHeader(),
  });
  return res.data;
};

// Only meal feedback
export const getMealFeedback = async (user_id, userProfile_id) => {
  const res = await axios.get(`${API_URL}/meal`, {
    params: { user_id, userProfile_id },
    ...getAuthHeader(),
  });
  return res.data;
};

// Only workout feedback
export const getWorkoutFeedback = async (user_id, userProfile_id) => {
  const res = await axios.get(`${API_URL}/workout`, {
    params: { user_id, userProfile_id },
    ...getAuthHeader(),
  });
  return res.data;
};