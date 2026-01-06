import MealSection from "./MealSection";
import "./MealPlanCard.css";
export default function MealPlanCard({ plan }) {
  return (
    <div className="mealplan-card">
      <div className="mealplan-header">
        <h2>Day Plan</h2>
        <div className="macros">
          <span>{plan.totalCalories} kcal</span>
          <span>{plan.totalProtein}g protein</span>
        </div>
      </div>

      <div className="meals-grid">
        {plan.meals.map(meal => (
          <MealSection key={meal.mealType} meal={meal} />
        ))}
      </div>
    </div>
  );
}
