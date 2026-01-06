import { FaCheck } from "react-icons/fa";
import "./ProgressMealSection.css";

export default function ProgressMealSection({
  meal,
  completed,
  onToggle,
  disabled
}) {
  return (
    <div className={`meal-row ${completed ? "completed" : ""}`}>
      <div className="meal-info">
        <h3>{meal.mealType}</h3>
        <p>{meal.items[0].name}</p>
      </div>

      <div
        className={`circle-checkbox 
          ${completed ? "checked" : ""} 
          ${disabled ? "disabled" : ""}`}
        onClick={!disabled ? onToggle : undefined}
      >
        {completed && <FaCheck />}
      </div>
    </div>
  );
}
