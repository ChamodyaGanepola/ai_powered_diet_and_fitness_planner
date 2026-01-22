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

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const totalDays =
    Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const completedSet = new Set(
    completedDates.map((d) => {
      const dd = new Date(d);
      dd.setHours(0, 0, 0, 0);
      return dd.getTime();
    })
  );

  let completedDays = 0;
  let missedDays = 0;
  let remainingDays = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const time = d.getTime();

    if (completedSet.has(time)) {
      completedDays++;
    } else if (time < today.getTime()) {
      missedDays++;
    } else {
      // today OR future
      remainingDays++;
    }
  }

  const progressPercent = Math.round((completedDays / totalDays) * 100);

  return {
    totalDays,
    completedDays,
    missedDays,
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
      const completedDates = await getCompletedProgressDates();

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
