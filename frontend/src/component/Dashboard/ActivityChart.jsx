import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./ActivityChart.css";

export default function ActivityChart({
  type,
  data,
  mealStart,
  mealEnd,
  workoutStart,
  workoutEnd,
}) {
 console.log("data", data);
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const mealStartStr = formatDate(new Date(mealStart));
  const mealEndStr = formatDate(new Date(mealEnd));
  const workoutStartStr = formatDate(new Date(workoutStart));
  const workoutEndStr = formatDate(new Date(workoutEnd));

  const chartData = data.map((d) => {
    const dateStr = d.date;
    const mealValue =
      dateStr >= mealStartStr && dateStr <= mealEndStr
        ? d.mealAdherenceScore
        : null;

    const workoutValue =
      dateStr >= workoutStartStr && dateStr <= workoutEndStr
        ? d.workoutAdherenceScore
        : null;

    return {
      date: dateStr.slice(5), // MM-DD
      meal: mealValue,
      workout: workoutValue,
      weight: d.weight,
      taken: d.totalCaloriesTaken,
      burned: d.totalCaloriesBurned,
    };
  });

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <Tooltip />

          {/* both meal + workout in one chart */}
          {type === "mealWorkout" && (
            <>
              <Line
                dataKey="meal"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="workout"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </>
          )}

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
