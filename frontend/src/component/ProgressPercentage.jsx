import React, { useEffect, useState } from "react";
import { getLatestMealPlan } from "../api/mealPlanApi";
import { getWorkoutPlanDetails } from "../api/workoutPlan";
import { getCompletedProgressDates } from "../api/dailyProgress";
import ProgressCircle from "./ProgressCircle";
import "./ProgressPercentage.css";
import Loading from "./Loading";
const ProgressPercentage = () => {
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

    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const completedSet = new Set(
      completedDates.map((d) => {
        const dd = new Date(d);
        dd.setHours(0, 0, 0, 0);
        return dd.getTime();
      }),
    );

    let completedDays = 0;
    let remainingDays = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const time = d.getTime();

      if (completedSet.has(time)) {
        completedDays++;
      } else if (time >= today.getTime()) {
        remainingDays++;
      }
    }

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
      try {
        const [mealRes, workoutRes] = await Promise.all([
          getLatestMealPlan(),
          getWorkoutPlanDetails(),
        ]);

        const completedDates = await getCompletedProgressDates();

        if (mealRes?.mealPlan) {
          setMealProgress(
            calculateProgress(
              mealRes.mealPlan.startDate,
              mealRes.mealPlan.endDate,
              completedDates.mealCompletedDates,
            ),
          );
        }

        if (workoutRes?.workoutPlan) {
          setWorkoutProgress(
            calculateProgress(
              workoutRes.workoutPlan.startDate,
              workoutRes.workoutPlan.endDate,
              completedDates.workoutCompletedDates,
            ),
          );
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load progress");
      }
    };

    fetchPlans();
  }, []);

  if (error) return <div>{error}</div>;
  if (!mealProgress && !workoutProgress)
    return <Loading text="Loading progress..." />;

  return (
    <div className="progress-container">

  {mealProgress && (
    <div className="progress-block">
      <h3 className="progress-title">Meal Plan</h3>
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
  )}

  {workoutProgress && (
    <div className="progress-block">
      <h3 className="progress-title">Workout Plan</h3>
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
  )}

</div>
  );
};

export default ProgressPercentage;
