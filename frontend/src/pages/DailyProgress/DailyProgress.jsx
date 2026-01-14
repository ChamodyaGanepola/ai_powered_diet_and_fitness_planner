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
    setMeals([]);
    setWorkouts([]);
    setLocked(false);

    try {
      const progressRes = await getDailyProgressByDate(user.id, date);
      const progress = progressRes.progress;

      if (progress) {
        if (progress.completed) {
          setLocked(true);
          return;
        } else {
          setMeals(progress.meals || []);
          setWorkouts(progress.workouts || []);
          setLocked(false);
          return;
        }
      }

      const [mealRes, workoutRes] = await Promise.all([
        getLatestMealPlan(user.id),
        getLatestWorkoutPlan(user.id),
      ]);

      // Map meal data
      const mealData = (mealRes?.mealPlan?.meals || []).map((m) => ({
        mealType: m.mealType,
        items: (m.foods || []).map((f) => ({
          ...f,
          selected: false,
        })),
      }));

      // Map workout data
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

  const handleMealSelection = (mealIdx, itemIdx) => {
    const newMeals = [...meals];
    newMeals[mealIdx].items = newMeals[mealIdx].items.map((item, idx) => ({
      ...item,
      selected: idx === itemIdx,
    }));
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

  // Compute daily macro totals based on selected foods
  const totalMacros = meals.reduce(
    (acc, meal) => {
      const selected = meal.items.find((i) => i.selected);
      if (selected) {
        acc.calories += selected.calories || 0;
        acc.protein += selected.protein || 0;
        acc.fat += selected.fat || 0;
        acc.carbs += selected.carbs || 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return (
    <div className="app-container">
      <Header />
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
            <div className="macro-summary">
              <h3>Selected Meal Macros</h3>
              <p>Calories: {totalMacros.calories} kcal</p>
              <p>Protein: {totalMacros.protein} g</p>
              <p>Fat: {totalMacros.fat} g</p>
              <p>Carbs: {totalMacros.carbs} g</p>
            </div>
            <div className="section meals-section">
              <h3>Meals</h3>
              {meals.map((meal, mIdx) => (
                <div
                  key={mIdx}
                  className={`meal-card ${locked ? "locked" : ""}`}
                >
                  <h4>{meal.mealType}</h4>
                  {meal.items.map((item, iIdx) => (
                    <div key={iIdx} className="meal-item">
                      <input
                        type="radio"
                        name={`meal-${mIdx}`}
                        disabled={locked}
                        checked={item.selected || false}
                        onChange={() => {
                          const newMeals = [...meals];
                          newMeals[mIdx].items = newMeals[mIdx].items.map(
                            (it, idx) => ({
                              ...it,
                              selected: idx === iIdx,
                            })
                          );
                          setMeals(newMeals);
                        }}
                      />

                      {/* Editable inputs if selected */}
                      <input
                        type="text"
                        disabled={locked || !item.selected}
                        value={item.name || ""}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIdx].items[iIdx].name = e.target.value;
                          setMeals(newMeals);
                        }}
                      />
                      <input
                        type="number"
                        disabled={locked || !item.selected}
                        value={item.calories || 0}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIdx].items[iIdx].calories = Number(
                            e.target.value
                          );
                          setMeals(newMeals);
                        }}
                      />
                      <span>kcal</span>

                      <input
                        type="number"
                        disabled={locked || !item.selected}
                        value={item.protein || 0}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIdx].items[iIdx].protein = Number(
                            e.target.value
                          );
                          setMeals(newMeals);
                        }}
                      />
                      <span>g protein</span>

                      <input
                        type="number"
                        disabled={locked || !item.selected}
                        value={item.fat || 0}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIdx].items[iIdx].fat = Number(
                            e.target.value
                          );
                          setMeals(newMeals);
                        }}
                      />
                      <span>g fat</span>

                      <input
                        type="number"
                        disabled={locked || !item.selected}
                        value={item.carbs || 0}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIdx].items[iIdx].carbs = Number(
                            e.target.value
                          );
                          setMeals(newMeals);
                        }}
                      />
                      <span>g carbs</span>
                    </div>
                  ))}
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
            {locked && (
              <p className="done">✔ Progress completed for this day</p>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
