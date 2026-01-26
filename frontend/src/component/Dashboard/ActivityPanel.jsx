import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./ActivityPanel.css";
import { getAllProgressForUser } from "../../api/dailyProgress";
import Loading from "../Loading";
const isBetween = (date, start, end) => {
  if (!start || !end) return false;
  const d = new Date(date);
  return d >= new Date(start) && d <= new Date(end);
};

export default function ActivityPanel({ title, subtitle, type, progressStatus, mealStart, mealEnd, workoutStart, workoutEnd }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
console.log("meal strat", mealStart);
console.log("meal end", mealEnd);
console.log("workout strat", workoutStart);
console.log("workout end", workoutEnd);
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      if (!progressStatus?.meal && !progressStatus?.workout) {
        setLoading(false);
        return;
      }

      const res = await getAllProgressForUser();

const filtered = (res.progress || []).filter(p => {
  // ADHERENCE graph
  if (type === "adherence") {
    return (
      (progressStatus.meal && isBetween(p.date, mealStart, mealEnd)) ||
      (progressStatus.workout && isBetween(p.date, workoutStart, workoutEnd))
    );
  }

  // CALORIES graph
  if (type === "calories") {
    return (
      (mealStart && mealEnd && isBetween(p.date, mealStart, mealEnd)) ||
      (workoutStart && workoutEnd && isBetween(p.date, workoutStart, workoutEnd))
    );
  }

  return false;
});


setData(filtered);

      setLoading(false);
    };

    load();
  }, [progressStatus]);

  if (loading) return <Loading text="Loading ..." />;

  if (!progressStatus?.meal && !progressStatus?.workout) {
    return (
      <div className="activity-panel">
        <h4>{title}</h4>
        <p>{subtitle}</p>
        <div className="no-progress">No progress yet</div>
      </div>
    );
  }

  
  const chartData = data.map((d) => {
  const isMealValid = isBetween(d.date, mealStart, mealEnd);
  const isWorkoutValid = isBetween(d.date, workoutStart, workoutEnd);
  
  return {
    date: d.date.slice(5, 10),
    meal: isMealValid ? d.mealAdherenceScore : null,
    workout: isWorkoutValid ? d.workoutAdherenceScore : null,
     taken: isMealValid ? d.totalCaloriesTaken : null,
    burned: isWorkoutValid ? d.totalCaloriesBurned : null,
  };
});


  return (
    <div className="activity-panel">
      <h4>{title}</h4>
      <p>{subtitle}</p>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" hide />
            <Tooltip />

            {type === "adherence" && (
              <>
                <Line
                  dataKey="meal"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  dataKey="workout"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </>
            )}

            {type === "calories" && (
              <>
                <Line
                  dataKey="taken"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  dataKey="burned"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
