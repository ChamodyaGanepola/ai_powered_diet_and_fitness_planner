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
  const [mealProgress, setMealProgress] = useState(null);
const [workoutProgress, setWorkoutProgress] = useState(null);

  const [error, setError] = useState("");


  const calculateProgress = (startDate, endDate, completedDates = []) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);
   
  const totalDays =
    Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const completedDays = completedDates.length;

  let pastDays = 0;
  for (let d = new Date(start); d <= end && d <= today; d.setDate(d.getDate() + 1)) {
    pastDays++;
  }
console.log("complete", completedDays);
  const remainingDays = Math.max(pastDays - completedDays, 0);
console.log("remain", remainingDays);
  const progressPercent = Math.round(
    (completedDays / totalDays) * 100
  );

  return {
    totalDays,
    completedDays,
    remainingDays,
    progressPercent,
  };
};



  useEffect(() => {
  const fetchPlans = async () => {
    try {
      const [mealRes, workoutRes] = await Promise.all([
        getLatestMealPlan(),
         getWorkoutPlanDetails(),
      ]);

      const meal = mealRes.mealPlan;
      const workout = workoutRes.workoutPlan;
     console.log("workout", workoutRes);
      const completedDates = await getCompletedProgressDates(meal._id);

      const mealProg = calculateProgress(
        meal.startDate,
        meal.endDate,
        completedDates.mealCompletedDates
      );

      const workoutProg = calculateProgress(
        workout.startDate,
        workout.endDate,
        completedDates.workoutCompletedDates
      );

      setMealProgress(mealProg);
      setWorkoutProgress(workoutProg);

    } catch (err) {
      console.error(err);
      setError("Failed to load progress");
    }
  };

  fetchPlans();
}, []);



if (error) return <div>{error}</div>;
if (!mealProgress || !workoutProgress) return <div>Loading...</div>;


  return (
    <div className="p-6 grid grid-cols-2 gap-6">

  {/* MEAL PROGRESS */}
  <div>
    <h3 className="text-center font-semibold mb-2">Meal Plan</h3>
    <ProgressCircle progress={mealProgress.progressPercent} />
    <div className="progress-info">
      <div className="info-card">
        <p className="label">Total</p>
        <p className="value">{mealProgress.totalDays}</p>
      </div>
      <div className="info-card">
        <p className="label">Completed</p>
        <p className="value">{mealProgress.completedDays}</p>
      </div>
      <div className="info-card">
        <p className="label">Remaining</p>
        <p className="value">{mealProgress.remainingDays}</p>
      </div>
    </div>
  </div>

  {/* WORKOUT PROGRESS */}
  <div>
    <h3 className="text-center font-semibold mb-2">Workout Plan</h3>
    <ProgressCircle progress={workoutProgress.progressPercent} />
    <div className="progress-info">
      <div className="info-card">
        <p className="label">Total</p>
        <p className="value">{workoutProgress.totalDays}</p>
      </div>
      <div className="info-card">
        <p className="label">Completed</p>
        <p className="value">{workoutProgress.completedDays}</p>
      </div>
      <div className="info-card">
        <p className="label">Remaining</p>
        <p className="value">{workoutProgress.remainingDays}</p>
      </div>
    </div>
  </div>

</div>

  );
};

export default ProgressPercentage;
