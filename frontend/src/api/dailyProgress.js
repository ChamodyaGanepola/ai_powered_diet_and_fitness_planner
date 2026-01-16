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

export const checkDailyProgressForUser = async (user_id) => {
  const res = await axios.get(
    `${API_URL}/checkProgress`,
    {
      params: { user_id },
      ...getAuthHeader(),
    }
  );
  return res.data;
};

export const createDailyProgress = async (
  user_id,
  date,
  weight,
  bodyFatPercentage,
  measurements,
  meals = [],
  workouts = []
) => {
  try {
    const response = await axios.post(
      `${API_URL}/daily`,
      { 
        user_id,
        date,
        weight,
        bodyFatPercentage,
        measurements,
        meals,
        workouts
      },
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
// RESET PLAN DATES IF NO PROGRESS EXISTS
// ---------------------------
export const resetPlanDatesIfNoProgress = async (user_id, selectedStartDate) => {
  try {
    const res = await axios.post(
      `${API_URL}/reset-plan-dates`,
      { user_id, selectedStartDate },
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("Reset Plan Dates API error:", err.response?.data || err.message);
    throw err;
  }
};


export const getCompletedProgressDates = async (
  userId,
  mealplanId,
  workoutplanId
) => {
  const params = { user_id: userId };
  if (mealplanId) params.mealplan_id = mealplanId;
  if (workoutplanId) params.workoutplan_id = workoutplanId;

  const res = await axios.get(
    `${API_URL}/completed-dates`,
    {
      params,
      ...getAuthHeader(),
    }
  );

  return res.data.completedDates || [];
};
