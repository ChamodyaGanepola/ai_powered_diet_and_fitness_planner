import axios from "axios";

const API_URL = "http://localhost:5000/api/daily-progress";


const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const checkDailyProgressForUser = async () => {
  const res = await axios.get(
    `${API_URL}/checkProgress`,
    {
      ...getAuthHeader(),
    }
  );
  return res.data;
};

export const createDailyProgress = async (
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
export const getDailyProgressByDate = async ( date) => {
  try {
    const res = await axios.get(`${API_URL}/daily`, {
      params: { date },
      ...getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Daily Progress by Date API error:", err.response?.data || err.message);
    throw err;
  }
};
// RESET PLAN DATES IF NO PROGRESS EXISTS

export const resetPlanDatesIfNoProgress = async ( selectedStartDate) => {
  try {
    const res = await axios.post(
      `${API_URL}/reset-plan-dates`,
      { selectedStartDate },
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("Reset Plan Dates API error:", err.response?.data || err.message);
    throw err;
  }
};


export const getCompletedProgressDates = async (
  mealplanId,
  workoutplanId
) => {
  const params = { };
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
