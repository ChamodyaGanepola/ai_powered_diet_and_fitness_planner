import "./FoodItemCard.css";

export default function FoodItemCard({ item }) {
  return (
    <div className="food-item-card">
      <div className="food-name">{item.name}</div>
      <div className="food-macros">
        <span>{item.calories} kcal</span>
        <span>{item.protein}g P</span>
        <span>{item.fat}g F</span>
      </div>
    </div>
  );
}
