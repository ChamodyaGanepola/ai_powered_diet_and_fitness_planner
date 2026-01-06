import { useState } from "react";
import MealSection from "./MealSection";
import { FaPlus } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./MealPlanCard.css";

export default function MealPlanCard({ plan, index }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleAddClick = () => setShowDatePicker(!showDatePicker);

  const handleAddPlan = () => {
    if (selectedDate) {
      alert(`New plan added for ${selectedDate.toLocaleDateString()}`);
      setSelectedDate(null);
      setShowDatePicker(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="mealplan-card">
      <div className="mealplan-header">
        <h2>Diet Plan #{index + 1}</h2> {/* <-- Use index here */}
        <div className="macros">
          <span>{plan.totalCalories} kcal</span>
          <span>{plan.totalProtein}g protein</span>
        </div>
        <FaPlus
          className="add-icon"
          onClick={handleAddClick}
          title="Add new meal plan"
        />
      </div>

      {showDatePicker && (
        <div className="datepicker-container">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Select a date"
            minDate={tomorrow} // Only allow tomorrow or later
          />
          <button className="add-button" onClick={handleAddPlan}>
            Add
          </button>
        </div>
      )}

      <div className="meals-grid">
        {plan.meals.map((meal) => (
          <MealSection key={meal.mealType} meal={meal} />
        ))}
      </div>
    </div>
  );
}
