import MealSection from "./MealSection";
import "react-datepicker/dist/react-datepicker.css";
import "./MealPlanCard.css";

export default function MealPlanCard({ plan, index }) {
  return (
    <div className="mealplan-card">
      <div className="mealplan-header">
        <h2>Diet Plan </h2>
        <div className="macros">
          <span>{plan.totalCalories || 1655} kcal</span>
          <span>{plan.totalProtein || 77}g protein</span>
          <span>{plan.totalFat || 46}g fat</span>
          <span>{plan.totalCarbs || 233}g carbs</span>
        </div>
      </div>

      <div className="meals-grid">
        {plan.meals.map((meal) => (
          <MealSection key={meal.mealType} meal={meal} />
        ))}
      </div>
    </div>
  );
}
