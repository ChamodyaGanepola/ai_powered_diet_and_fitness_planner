// components/SavedDailyProgress.jsx
import MealPlanCard from "./MealPlanCard";
import WorkoutCard from "./WorkoutCard";
import BodyMetricsCard from "./BodyMetricsCard";
import CaloriesSummaryCard from "./CaloriesSummaryCard";
import "./SavedDailyProgress.css";

export default function SavedDailyProgress({ progress }) {
  if (!progress) return null;

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
      {progress.meals?.length > 0 && (
        <MealPlanCard
          plan={{
            meals: progress.meals,
            totalCalories: progress.totalCaloriesTaken,
            totalProtein: progress.meals.reduce(
              (a, m) =>
                a +
                m.items.reduce((x, i) => x + (i.protein || 0), 0),
              0
            ),
            totalFat: progress.meals.reduce(
              (a, m) =>
                a + m.items.reduce((x, i) => x + (i.fat || 0), 0),
              0
            ),
            totalCarbs: progress.meals.reduce(
              (a, m) =>
                a +
                m.items.reduce((x, i) => x + (i.carbohydrates || 0), 0),
              0
            ),
          }}
          showHeader={false}
        />
      )}

      {/* Workouts */}
      {progress.workouts?.length > 0 && (
        <div className="saved-workouts">
          {progress.workouts.map((w, i) => (
            <WorkoutCard key={i} workout={w} />
          ))}
        </div>
      )}
    </div>
  );
}
