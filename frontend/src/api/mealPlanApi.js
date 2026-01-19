import axios from "axios";

const API_URL = "http://localhost:5000/api/meal-plan";

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
   CREATE MEAL PLAN
   POST /create
---------------------------- */
export const createMealPlan = async () => {
  try {
    const res = await axios.post(
      `${API_URL}/create`,
      {},                 
      getAuthHeader()     
    );
    return res.data;
  } catch (err) {
    console.error("Create Meal Plan Error:", err);
    throw err;
  }
};


/* ---------------------------
   GET LATEST ACTIVE MEAL PLAN
   GET /latest?user_id=
---------------------------- */
export const getLatestMealPlan = async () => {
  try {
    const res = await axios.get(`${API_URL}/latest`, {
      ...getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Get Latest Meal Plan Error:", err);
    throw err;
  }
};

/* ---------------------------
   GET COMPLETED MEAL PLANS
---------------------------- */
export const getCompletedMealPlans = async () => {
  try {
    const res = await axios.get(`${API_URL}/completed`, {
      ...getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Get Completed Meal Plans Error:", err);
    throw err;
  }
};

/* ---------------------------
   GET NOT-SUITABLE MEAL PLANS
---------------------------- */
export const getNotSuitableMealPlans = async () => {
  try {
    const res = await axios.get(`${API_URL}/not-suitable`, {
      ...getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Get Not Suitable Meal Plans Error:", err);
    throw err;
  }
};

/* ---------------------------
   UPDATE MEAL PLAN STATUS
   PUT /status/:mealPlanId
---------------------------- */
export const updateMealPlanStatus = async (mealPlanId, status) => {
  try {
    const res = await axios.put(
      `${API_URL}/status/${mealPlanId}`,
      { status },
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("Update Meal Plan Status Error:", err);
    throw err;
  }
};

/* ---------------------------
   UPDATE MEAL PLAN START DATE
---------------------------- */
export const updateMealPlanStartDate = async (mealPlanId, startDate) => {
  try {
    const res = await axios.patch(
      `${API_URL}/${mealPlanId}/start-date`,
      { startDate },
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    console.error("Update Meal Plan Start Date Error:", err);
    throw err;
  }
};

/* ---------------------------
   DELETE MEAL PLANS BY USER & PROFILE
   DELETE /?user_id=&userProfile_id=
---------------------------- */
export const deleteMealPlansByUserProfile = async (
  userProfile_id
) => {
  try {
    const res = await axios.delete(`${API_URL}`, {
      params: { userProfile_id },
      ...getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Delete Meal Plans Error:", err);
    throw err;
  }
};
