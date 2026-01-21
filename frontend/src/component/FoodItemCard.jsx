import "./FoodItemCard.css";

export default function FoodItemCard({ item }) {
  return (
    <div className="food-plan-card">
      
      {/* LEFT */}
      <div className="food-left">
        <h4 className="food-title">{item.name}</h4>
       
      </div>

      {/* RIGHT */}
      <div className="food-right">
        <div className="food-metric kcal">
          <span className="value">{item.calories}</span>
          <span className="label">Kcal</span>
        </div>

        <div className="food-metric carbs">
          <span className="value">{item.carbohydrates}g</span>
          <span className="label">Carbs</span>
        </div>

        <div className="food-metric protein">
          <span className="value">{item.protein}g</span>
          <span className="label">Protein</span>
        </div>

        <div className="food-metric fat">
          <span className="value">{item.fat}g</span>
          <span className="label">Fat</span>
        </div>
      </div>

    </div>
  );
}

