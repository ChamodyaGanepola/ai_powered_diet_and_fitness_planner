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
  const res = await axios.get(`${API_URL}/checkProgress`, getAuthHeader());
  return res.data;
};
export const getAllProgressForUser = async () => {
  const res = await axios.get(`${API_URL}/all`, getAuthHeader());
  return res.data;
};
export const getDailyProgressRange = async (startStr, endStr) => {
  const res = await axios.get(`${API_URL}/range`, {
    params: { start: startStr, end: endStr },
    ...getAuthHeader(),
  });

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

export const getDailyProgressByDate = async (date) => {
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


export const resetPlanDatesIfNoProgress = async ({
  selectedMealStartDate,
  selectedWorkoutStartDate,
}) => {
  try {
    console.log("selectedMealStartDate -", selectedMealStartDate);
    console.log("selectedWorkoutStartDate -", selectedWorkoutStartDate);

    const res = await axios.post(
      `${API_URL}/reset-plan-dates`,
      {
        selectedMealStartDate,
        selectedWorkoutStartDate,
      },
      getAuthHeader()
    );

    return res.data;
  } catch (err) {
    console.error(
      "Reset Plan Dates API error:",
      err.response?.data || err.message
    );
    throw err;
  }
};


export const getCompletedProgressDates = async () => {
  const res = await axios.get(`${API_URL}/completed-dates`, getAuthHeader());
  return res.data;
};

export const updateDailyProgress = async (
  date,
  weight,
  bodyFatPercentage,
  measurements,
  meals = [],
  workouts = []
) => {
  try {
    const response = await axios.put(
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
    console.error("Update Daily Progress API error:", err.response?.data || err.message);
    throw err;
  }
};