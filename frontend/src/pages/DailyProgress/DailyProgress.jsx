import { useState, useEffect } from "react";
import "./DailyProgress.css";
import { useAuth } from "../../context/authContext.jsx";
import { getLatestWorkoutPlan } from "../../api/workoutPlan.js";
import { getLatestMealPlan } from "../../api/mealPlanApi.js";
import {
  getDailyProgressByDate,
  createDailyProgress,
} from "../../api/dailyProgress.js";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
export default function DailyProgress() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [date]);
  const fetchData = async () => {
    setLoading(true);

    // reset state for new date
    setMeals([]);
    setWorkouts([]);
    setLocked(false);

    try {
      const progressRes = await getDailyProgressByDate(user.id, date);
       console.log("Daily Progress Response:", progressRes);
      const progress = progressRes.progress;
     

      if (progress) {
        if (progress.completed) {
          // CASE: completed → lock and do not show meals/workouts
          setLocked(true);
          return;
        } else {
          // CASE: exists but not completed → show data for editing
          setMeals(progress.meals || []);
          setWorkouts(progress.workouts || []);
          setLocked(false);
          return;
        }
      }

      // CASE: no progress → load AI plans
      const [mealRes, workoutRes] = await Promise.all([
        getLatestMealPlan(user.id),
        getLatestWorkoutPlan(user.id),
      ]);

      const mealData = (mealRes?.mealPlan || []).map((m) => ({
        mealType: m.mealType,
        items: (m.foods || []).map((f) => ({
          name: f.name,
          calories: f.calories,
          protein: f.protein,
          fat: f.fat,
          unit: f.unit || "serving",
        })),
        totalCalories: (m.foods || []).reduce(
          (acc, f) => acc + (f.calories || 0),
          0
        ),
      }));

      const workoutData = (workoutRes?.workoutPlan || []).map((w) => ({
        name: w.name,
        targetMuscle: w.targetMuscle,
        sets: w.sets,
        reps: w.reps,
        caloriesBurned: 0,
        duration: 45,
      }));

      setMeals(mealData);
      setWorkouts(workoutData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMealChange = (mealIdx, itemIdx, key, value) => {
    const newMeals = [...meals];
    if (["calories", "protein", "fat"].includes(key)) value = Number(value);
    newMeals[mealIdx].items[itemIdx][key] = value;
    newMeals[mealIdx].totalCalories = newMeals[mealIdx].items.reduce(
      (acc, f) => acc + (f.calories || 0),
      0
    );
    setMeals(newMeals);
  };

  const handleWorkoutChange = (idx, key, value) => {
    const newWorkouts = [...workouts];
    if (["sets", "caloriesBurned", "duration"].includes(key))
      value = Number(value);
    newWorkouts[idx][key] = value;
    setWorkouts(newWorkouts);
  };

  const submitDay = async () => {
    if (
      !window.confirm("Are you sure you want to submit? You can't edit again!")
    )
      return;

    try {
      await createDailyProgress(user.id, date, meals, workouts);
      setLocked(true);
      alert("Progress saved successfully!");
    } catch {
      alert("Failed to save progress.");
    }
  };

  return (
    <div className="app-container"><Header />
    <div className="progress-page">
      <h2>Daily Progress Tracker</h2>
      <input
        type="date"
        max={new Date().toISOString().split("T")[0]}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="date-picker"
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="section meals-section">
            <h3>Meals</h3>
            {meals.map((meal, mIdx) => (
              <div key={mIdx} className="meal-card">
                <h4>{meal.mealType}</h4>
                {meal.items.map((item, iIdx) => (
                  <div key={iIdx} className="meal-item">
                    <input
                      type="text"
                      disabled={locked}
                      value={item.name}
                      onChange={(e) =>
                        handleMealChange(mIdx, iIdx, "name", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      disabled={locked}
                      value={item.calories}
                      onChange={(e) =>
                        handleMealChange(mIdx, iIdx, "calories", e.target.value)
                      }
                    />
                    <span>kcal</span>
                  </div>
                ))}
                <p className="meal-total">
                  Total Calories: {meal.totalCalories}
                </p>
              </div>
            ))}
          </div>

          <div className="section workouts-section">
            <h3>Workouts</h3>
            {workouts.map((w, idx) => (
              <div key={idx} className="workout-card">
                <input
                  type="text"
                  disabled={locked}
                  value={w.name}
                  onChange={(e) =>
                    handleWorkoutChange(idx, "name", e.target.value)
                  }
                />
                <input
                  type="number"
                  disabled={locked}
                  value={w.sets}
                  onChange={(e) =>
                    handleWorkoutChange(idx, "sets", e.target.value)
                  }
                />
                <input
                  type="text"
                  disabled={locked}
                  value={w.reps}
                  onChange={(e) =>
                    handleWorkoutChange(idx, "reps", e.target.value)
                  }
                />
                <input
                  type="number"
                  disabled={locked}
                  value={w.caloriesBurned}
                  onChange={(e) =>
                    handleWorkoutChange(idx, "caloriesBurned", e.target.value)
                  }
                />
                <span>kcal</span>
              </div>
            ))}
          </div>

          {!locked && (
            <button className="submit-day" onClick={submitDay}>
              Submit Day
            </button>
          )}
          {locked && <p className="done">✔ Progress completed for this day</p>}
        </>
      )}
    </div>
    <Footer />
    </div>
  );
}
