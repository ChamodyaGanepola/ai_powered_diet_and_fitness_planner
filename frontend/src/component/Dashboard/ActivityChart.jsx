import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, Tooltip } from "recharts";
import "./ActivityChart.css";

const barData = [
  { d: "S", v: 5 },
  { d: "M", v: 6 },
  { d: "T", v: 7 },
  { d: "W", v: 8 },
  { d: "T", v: 9 },
  { d: "F", v: 7 },
  { d: "S", v: 6 },
];

const lineData = [
  { d: "S", v: 3 },
  { d: "M", v: 5 },
  { d: "T", v: 4 },
  { d: "W", v: 6 },
  { d: "T", v: 5 },
  { d: "F", v: 7 },
  { d: "S", v: 6 },
];

export default function ActivityChart({ type }) {
  if (type === "cycling" || type === "gym") {
    return (
      <LineChart width={220} height={90} data={lineData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={false}
        />
        <Tooltip content={null} />
      </LineChart>
    );
  }

  return (
    <BarChart width={220} height={90} data={barData}>
      <Bar dataKey="v" radius={[8, 8, 0, 0]} fill="#6366f1" />
      <XAxis dataKey="d" tick={{ fontSize: 10 }} />
    </BarChart>
  );
}
