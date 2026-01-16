import { useState, useEffect } from "react";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import MealPlanCard from "../../component/MealPlanCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import {
  getLatestMealPlan,
  updateMealPlanStatus,
  createMealPlan,
} from "../../api/mealPlanApi.js";
import "./DietPlan.css";

export default function DietPlan() {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [activeMealPlanId, setActiveMealPlanId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    setLoading(true);
    try {
      const res = await getLatestMealPlan(user.id);

      if (res.success && res.mealPlan) {
        const plan = res.mealPlan;
        setActiveMealPlanId(plan._id);

        const transformedPlan = {
          meals: (plan.meals || []).map((m) => ({
            mealType: m.mealType,
            items: (m.foods || []).map((f) => ({
              name: f.name,
              calories: f.calories,
              protein: f.protein,
              fat: f.fat,
            })),
          })),
          totalCalories: plan.totalCalories,
          totalProtein: plan.totalProtein,
          totalCarbs: plan.totalCarbs,
          totalFat: plan.totalFat,
        };

        setMealPlans([transformedPlan]);
      } else {
        setMealPlans([]);
        setActiveMealPlanId(null);
      }
    } catch (err) {
      console.error("Error fetching meal plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMealPlan = async () => {
    if (!activeMealPlanId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this meal plan?"
    );
    if (!confirmed) return;

    try {
      await updateMealPlanStatus(activeMealPlanId, "not-suitable");
      await fetchMealPlans();
    } catch (err) {
      console.error("Failed to delete meal plan:", err);
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      await createMealPlan(user.id);
      await fetchMealPlans();
    } catch (err) {
      console.error("Failed to generate meal plan:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="diet-page">
        {loading ? (
          <p className="loading-text">Loading meal plans...</p>
        ) : mealPlans.length === 0 ? (
          <div className="empty-state centered-card">
            <h1 className="greeting">Hey {user.username},</h1>
            <p className="no-plan-text">
              No active meal plan available. You can generate one based on your profile.
            </p>
            <button
              className="generate-btn"
              onClick={handleGenerateMealPlan}
              disabled={loading}
            >
              Generate Meal Plan
            </button>
          </div>
        ) : (
          <>
            {mealPlans.map((plan, index) => (
              <MealPlanCard key={index} plan={plan} index={index} />
            ))}

            <div className="delete-wrapper">
              <button
                className="delete-button"
                onClick={handleDeleteMealPlan}
                disabled={loading}
              >
                Delete Meal Plan
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
