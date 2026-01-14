import { useState, useEffect } from "react";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import MealPlanCard from "../../component/MealPlanCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { getLatestMealPlan } from "../../api/mealPlanApi.js";
import "./DietPlan.css";

export default function DietPlan() {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
  setLoading(true);
  try {
    const res = await getLatestMealPlan(user.id);
    console.log(res.mealPlan); // This is an object

    if (res.success && res.mealPlan) {
      const plan = res.mealPlan;

      // Transform backend meal plan into the shape MealPlanCard expects
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

      console.log("Transformed Meal Plan:", transformedPlan);

      setMealPlans([transformedPlan]); // wrap in array for mapping
    }
  } catch (err) {
    console.error("Error fetching meal plans:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Header />
      <div className="diet-page">
        <h1>{user.username}, welcome to your Diet Plans</h1>

        {loading ? (
          <p>Loading meal plans...</p>
        ) : mealPlans.length === 0 ? (
          <p>No meal plans available.</p>
        ) : (
          mealPlans.map((plan, index) => (
            <MealPlanCard key={index} plan={plan} index={index} />
          ))
        )}
      </div>
      <Footer />
    </>
  );
}
