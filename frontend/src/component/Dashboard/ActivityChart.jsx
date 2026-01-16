import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./ActivityChart.css";

export default function ActivityChart({ type, data }) {
  const chartData = data.map(d => ({
    date: d.date.slice(5, 10),
    meal: d.mealAdherenceScore,
    workout: d.workoutAdherenceScore,
    weight: d.weight,
    taken: d.totalCaloriesTaken,
    burned: d.totalCaloriesBurned,
  }));

  return (
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

          {type === "weight" && (
            <Line
              dataKey="weight"
              stroke="#f59e0b"
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
  );
}
