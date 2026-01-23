import { FaTimesCircle } from "react-icons/fa";
import FoodItemCard from "./FoodItemCard";
import "./MealSection.css";

export default function MealSection({ meal }) {
  const isSkipped = !meal.items || meal.items.length === 0;

  return (
    <div
      className={`meal-card ${meal.mealType.toLowerCase()} ${
        isSkipped ? "skipped" : ""
      }`}
    >
      <h3 className="meal-title">
        {meal.mealType}
        {isSkipped && (
          <span className="skipped-badge">
            <FaTimesCircle className="skipped-icon" /> Skipped
          </span>
        )}
      </h3>

      {isSkipped ? (
        <p className="skipped-text">
          <FaTimesCircle className="skipped-icon" />
          This meal was skipped
        </p>
      ) : (
        meal.items.map((item, index) => (
          <FoodItemCard key={index} item={item} />
        ))
      )}
    </div>
  );
}
