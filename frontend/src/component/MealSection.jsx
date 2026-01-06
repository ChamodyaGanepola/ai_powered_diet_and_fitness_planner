import FoodItemCard from "./FoodItemCard";
import "./MealSection.css";

export default function MealSection({ meal }) {
  return (
    <div className={`meal-card ${meal.mealType.toLowerCase()}`}>
      <h3 className="meal-title">{meal.mealType}</h3>

      {meal.items.map((item, index) => (
        <FoodItemCard key={index} item={item} />
      ))}
    </div>
  );
}
