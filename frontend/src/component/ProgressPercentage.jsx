import React, { useEffect, useState } from "react";
import {
  getLatestMealPlan,
} from "../api/mealPlanApi";
import {
 getWorkoutPlanDetails,
} from "../api/workoutPlan";
import {
  getCompletedProgressDates,
} from "../api/dailyProgress";
import ProgressCircle from "./ProgressCircle";
import "./ProgressPercentage.css"
const ProgressPercentage = () => {
  const [mealPlan, setMealPlan] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const areDatesSame = (mealPlan, workoutPlan) => {
    if (!mealPlan || !workoutPlan) return false;

    const mealStart = new Date(mealPlan.startDate).toISOString().slice(0, 10);
    const mealEnd = new Date(mealPlan.endDate).toISOString().slice(0, 10);

    const workoutStart = new Date(workoutPlan.startDate).toISOString().slice(0, 10);
    const workoutEnd = new Date(workoutPlan.endDate).toISOString().slice(0, 10);

    return mealStart === workoutStart && mealEnd === workoutEnd;
  };

  const calculateProgress = (startDate, endDate, completedDates) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const completedDays = completedDates.length;

  // Count only days that are before today AND not completed
  const dayList = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    dayList.push(dateStr);
  }

  const notCompletedDays = dayList.filter(
    (d) => !completedDates.includes(d) && new Date(d) <= today
  ).length;

  const remainingDays = notCompletedDays;

  const progressPercent = Math.round((completedDays / totalDays) * 100);

  return {
    totalDays,
    completedDays,
    remainingDays,
    progressPercent,
  };
};


  useEffect(() => {
  const fetchPlans = async () => {
    setError("");
    try {
      const [mealRes, workoutRes] = await Promise.all([
        getLatestMealPlan(),
        getWorkoutPlanDetails(),
      ]);

      const meal = mealRes.mealPlan;
      const workout = workoutRes.workoutPlan;

      console.log("meal", meal);
      console.log("workout", workout);

      // Use local variables instead of state
      if (!areDatesSame(meal, workout)) {
        setError("Meal and Workout plan dates do not match.");
        return;
      }
      console.log("data same", areDatesSame(meal, workout))

      const completedDates = await getCompletedProgressDates(
        meal._id,
        workout.id
      );

      console.log("completed dates", completedDates);

      const progressObj = calculateProgress(
        meal.startDate,
        meal.endDate,
        completedDates
      );

      console.log("progressObj", progressObj);
      setProgress(progressObj);

    } catch (err) {
      setError("Failed to fetch plans.");
      console.error(err);
    }
  };

  fetchPlans();
}, []);


  if (error) return <div>{error}</div>;
  if (!progress) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-center relative">
        <ProgressCircle progress={progress.progressPercent} />
      </div>

     <div className="progress-info">
  <div className="info-card">
    <p className="label">Total Days</p>
    <p className="value">{progress.totalDays}</p>
  </div>
  <div className="info-card">
    <p className="label">Completed</p>
    <p className="value">{progress.completedDays}</p>
  </div>
  <div className="info-card">
    <p className="label">Remaining</p>
    <p className="value">{progress.remainingDays}</p>
  </div>
</div>

    </div>
  );
};

export default ProgressPercentage;
