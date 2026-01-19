import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ProgressCircle = ({ progress }) => {
  const color =
    progress >= 80 ? "#22c55e" :
    progress >= 50 ? "#f59e0b" :
    "#ef4444";

  return (
    <div style={{ width: 120, height: 120 }}>  {/* <-- IMPORTANT */}
      <CircularProgressbar
        value={progress}
        text={`${progress}%`}
        styles={buildStyles({
          pathColor: color,
          textColor: "#111827",
          trailColor: "#d1d5db",
          strokeLinecap: "round",
          textSize: "20px",
        })}
      />
    </div>
  );
};

export default ProgressCircle;
