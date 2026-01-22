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
export default function ActivityPanel({ title, subtitle, type, progressStatus }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // if no progress exists for both plans, don't fetch
      if (!progressStatus?.meal && !progressStatus?.workout) {
        setLoading(false);
        return;
      }

      const res = await getAllProgressForUser();
      console.log("inside activity panel", res); // NEW API
      setData(res.progress || []);
      setLoading(false);
    };

    load();
  }, [progressStatus]);


  if (loading) {return <Loading text="Loading ..." />};
  if (!progressStatus?.meal && !progressStatus?.workout) {
    return (
      <div className="activity-panel">
        <h4>{title}</h4>
        <p>{subtitle}</p>
        <div className="no-progress">No progress yet</div>
      </div>
    );
  }

  const chartData = data.map(d => ({
    date: d.date.slice(5, 10),
    meal: d.mealAdherenceScore,
    workout: d.workoutAdherenceScore,
    taken: d.totalCaloriesTaken,
    burned: d.totalCaloriesBurned,
  }));
console.log("chart data", chartData)
  return (
    <div className="activity-panel">
      <h4>{title}</h4>
      <p>{subtitle}</p>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" hide />
            <Tooltip />

            {type === "meal" && (
              <Line dataKey="meal" stroke="#22c55e" strokeWidth={2} dot={false} />
            )}

            {type === "workout" && (
              <Line
                dataKey="workout"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            )}

            {type === "calories" && (
              <>
                <Line
                  dataKey="taken"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="burned"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
