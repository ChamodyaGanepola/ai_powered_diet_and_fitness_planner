import axios from "axios";

const API_URL = "http://localhost:5000/api/meal-plan";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
// CREATE meal plan
export const createMealPlan = async (userProfile) => {
  try {
    const response = await axios.post(
      `${API_URL}/create`,
      userProfile,
      getAuthHeader()
    );
    return response.data;
  } catch (err) {
    console.error("Meal plan API error:", err);
    throw err;
  }
};
