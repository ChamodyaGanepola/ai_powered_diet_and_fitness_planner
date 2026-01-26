// components/SavedDailyProgress.jsx
import { useEffect, useState } from "react";
import MealPlanCard from "./MealPlanCard";
import WorkoutCard from "./WorkoutCard";
import BodyMetricsCard from "./BodyMetricsCard";
import CaloriesSummaryCard from "./CaloriesSummaryCard";
import Loading from "./Loading";
import { getDailyProgressByDate } from "../api/dailyProgress";
import { FaTimesCircle } from "react-icons/fa";
import "./SavedDailyProgress.css";

export default function SavedDailyProgress({ date }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const res = await getDailyProgressByDate(date);
        setProgress(res?.progress || null);
        console.log("res", res);
        console.log("res.progress", res.progress);
      } catch (err) {
        console.error("Failed to load saved progress", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [date]);

  if (loading) return <Loading text="Loading saved progress..." />;

  if (!progress) {
    return <p className="no-progress-msg">No saved progress for this date.</p>;
  }

  const meals = progress.meals || [];
  const workouts = progress.workouts || [];

  const hasAnyMealItems = meals.some(
    (m) => Array.isArray(m.items) && m.items.length > 0
  );

  const totalProtein = meals.reduce(
    (a, m) =>
      a +
      (m.items || []).reduce((x, i) => x + (i.protein || 0), 0),
    0
  );

  const totalFat = meals.reduce(
    (a, m) =>
      a + (m.items || []).reduce((x, i) => x + (i.fat || 0), 0),
    0
  );

  const totalCarbs = meals.reduce(
    (a, m) =>
      a + (m.items || []).reduce((x, i) => x + (i.carbohydrates || 0), 0),
    0
  );

  return (
    <div className="saved-progress">
      {/* Body Metrics */}
      <BodyMetricsCard
        weight={progress.weight}
        bodyFat={progress.bodyFatPercentage}
        measurements={progress.measurements}
        date={progress.date}
      />

      {/* Calories Summary */}
      <CaloriesSummaryCard
        taken={progress.totalCaloriesTaken}
        burned={progress.totalCaloriesBurned}
      />

      {/* Meals */}
      {meals.length > 0 ? (
        <MealPlanCard
          plan={{
            meals,
            totalCalories: progress.totalCaloriesTaken,
            totalProtein,
            totalFat,
            totalCarbs,
          }}
          showHeader={false}
        />
      ) : progress.mealPlan_id != null ?  (
        <div className="meal-skipped">
          <FaTimesCircle className="skipped-icon" />
          <strong>All meals skipped</strong>
        </div>
      ) : null}

      {/* Workouts */}
      {workouts.length > 0 ? (
        <div className="saved-workouts">
          {workouts.map((w, i) => (
            <WorkoutCard key={i} workout={w} />
          ))}
        </div>
      ) : progress.workoutPlan_id != null ?  (
        <div className="workout-skipped">
          <FaTimesCircle className="skipped-icon" />
          <strong>Workout Skipped</strong>
        </div>
      ): null}
    </div>
  );
}
