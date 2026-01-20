import MealSection from "./MealSection";
import "react-datepicker/dist/react-datepicker.css";
import "./MealPlanCard.css";
import PageHeader from "./PageHeader.jsx";
import { FaAppleAlt } from "react-icons/fa";


export default function MealPlanCard({ plan, index }) {
  return (
    <div className="mealplan-card">
      <div className="mealplan-header">
                <PageHeader
          icon={<FaAppleAlt />}
          title="Your Diet Plan"
          subtitle="Personalized nutrition designed to support your goals"
        />
        
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
