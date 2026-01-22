import React, { useState } from "react";
import "./ProgressCalendar.css";

export default function ProgressCalendar({
  mealStart,
  mealEnd,
  workoutStart,
  workoutEnd,
  completedMeals = [],
  completedWorkouts = [],
}) {
  const [index, setIndex] = useState(0);

  // ---------- fallback logic ----------
  const today = new Date();
  const todayStr = toDateStr(today);

  const effectiveMealStart = mealStart
    ? new Date(mealStart)
    : new Date(today.getFullYear(), today.getMonth(), 1);

  const effectiveMealEnd = mealEnd
    ? new Date(mealEnd)
    : new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const effectiveWorkoutStart = workoutStart
    ? new Date(workoutStart)
    : effectiveMealStart;

  const effectiveWorkoutEnd = workoutEnd
    ? new Date(workoutEnd)
    : effectiveMealEnd;

  const start = new Date(
    Math.min(effectiveMealStart, effectiveWorkoutStart)
  );
  const end = new Date(
    Math.max(effectiveMealEnd, effectiveWorkoutEnd)
  );

  // ---------- safe arrays ----------
  const safeMeals = Array.isArray(completedMeals) ? completedMeals : [];
  const safeWorkouts = Array.isArray(completedWorkouts)
    ? completedWorkouts
    : [];

  // ---------- generate months ----------
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  const month = months[index] || months[0];
  const monthName = month.toLocaleString("default", { month: "long" });
  const year = month.getFullYear();

  const firstDay = new Date(year, month.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, month.getMonth() + 1, 0).getDate();

  const prevMonth = () => setIndex((i) => Math.max(0, i - 1));
  const nextMonth = () =>
    setIndex((i) => Math.min(months.length - 1, i + 1));

  // helper
  function toDateStr(d) {
    return d.toISOString().split("T")[0];
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button onClick={prevMonth} disabled={index === 0} className="nav-btn">
          ←
        </button>

        <div className="month-title">
          {monthName} {year}
        </div>

        <button
          onClick={nextMonth}
          disabled={index === months.length - 1}
          className="nav-btn"
        >
          →
        </button>
      </div>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="calendar-header-day">
            {d}
          </div>
        ))}

        {Array(firstDay)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="calendar-cell empty" />
          ))}

        {Array(daysInMonth)
          .fill(null)
          .map((_, i) => {
            const date = new Date(year, month.getMonth(), i + 1);
            const dateStr = toDateStr(date);

            const mealDone = safeMeals.includes(dateStr);
            const workoutDone = safeWorkouts.includes(dateStr);

            const completedType =
              mealDone && workoutDone
                ? "both"
                : mealDone
                ? "meal"
                : workoutDone
                ? "workout"
                : "none";

            const isToday = dateStr === todayStr;
            const isStart =
              dateStr === toDateStr(effectiveMealStart) ||
              dateStr === toDateStr(effectiveWorkoutStart);
            const isEnd =
              dateStr === toDateStr(effectiveMealEnd) ||
              dateStr === toDateStr(effectiveWorkoutEnd);

            const isPastFromStart =
              date >= start &&
              date < today &&
              !mealDone &&
              !workoutDone;

            return (
              <div
                key={dateStr}
                className={`calendar-cell
                  ${isPastFromStart ? "past" : ""}
                  ${isToday ? "today" : ""}
                  ${isStart ? "start" : ""}
                  ${isEnd ? "end" : ""}
                `}
                data-tooltip={
                  isStart
                    ? "Start Date"
                    : isEnd
                    ? "End Date"
                    : completedType === "both"
                    ? "Meal + Workout Completed"
                    : completedType === "meal"
                    ? "Meal Completed"
                    : completedType === "workout"
                    ? "Workout Completed"
                    : isPastFromStart
                    ? "Missed Day"
                    : "Not Completed"
                }
              >
                {i + 1}

                {completedType !== "none" && (
                  <span
                    className={`tick ${
                      completedType === "both"
                        ? "both"
                        : completedType === "meal"
                        ? "meal"
                        : "workout"
                    }`}
                  >
                    ✔
                  </span>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
