import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MealSection from "../../component/ProgressMealSection.jsx";
import "./Progress.css";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
//Meal data should have date selected by user to track progress
const mealsData = [
  {
        mealType: "Breakfast",
        items: [
          { name: "Smoked salmon", calories: 140, protein: 16, fat: 5 },
          { name: "Whole wheat toast", calories: 120, protein: 6, fat: 2 }
        ]
      },
      {
        mealType: "Lunch",
        items: [
          { name: "Grilled chicken", calories: 300, protein: 35, fat: 6 }
        ]
      },
      {
        mealType: "Snack",
        items: [
          { name: "Greek yogurt", calories: 150, protein: 15, fat: 4 }
        ]
      },
      {
        mealType: "Dinner",
        items: [
          { name: "Salmon & veggies", calories: 400, protein: 30, fat: 12 }
        ]
      }];

export default function Progress() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [completedByDate, setCompletedByDate] = useState({});

  const dateKey = selectedDate.toISOString().split("T")[0];
  const completedMeals = completedByDate[dateKey] || {};

  const isFutureDate = selectedDate > today;

  const toggleMeal = (mealType) => {
    if (isFutureDate) return;

    setCompletedByDate((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: !prev[dateKey]?.[mealType],
      },
    }));
  };

  const completedCount = Object.values(completedMeals).filter(Boolean).length;
  const totalMeals = mealsData.length;
  const progressPercent = (completedCount / totalMeals) * 100;

  return (
    <>
      <Header />
      <div className="diet-dashboard">
        <div className="dashboard-header">
          <h1>Hello 👋</h1>

          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            className="date-picker"
          />
        </div>

        {/* Progress */}
        <div className="progress-wrapper">
          <p>
            {completedCount} / {totalMeals} meals completed
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Meal Plan */}
        <div className="meal-plan">
          {mealsData.map((meal) => (
            <MealSection
              meal={meal}
              completed={completedMeals[meal.mealType]}
              disabled={isFutureDate}
              onToggle={() => toggleMeal(meal.mealType)}
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
