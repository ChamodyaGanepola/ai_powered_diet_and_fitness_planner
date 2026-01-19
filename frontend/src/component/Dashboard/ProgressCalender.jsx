import React, { useState } from "react";
import "./ProgressCalendar.css";

export default function ProgressCalendar({ startDate, endDate, completedDates = [] }) {
  // ✅ hooks MUST be at top
  const [index, setIndex] = useState(0);

  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Generate month list
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  const month = months[index];

  const monthName = month.toLocaleString("default", { month: "long" });
  const year = month.getFullYear();

  const toDateStr = (d) => {
    return d.toISOString().split("T")[0];
  };

  const today = new Date();
  const todayStr = toDateStr(today);

  const firstDay = new Date(year, month.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, month.getMonth() + 1, 0).getDate();

  const prevMonth = () => setIndex((i) => Math.max(0, i - 1));
  const nextMonth = () => setIndex((i) => Math.min(months.length - 1, i + 1));

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button onClick={prevMonth} disabled={index === 0} className="nav-btn">←</button>
        <div className="month-title">{monthName} {year}</div>
        <button onClick={nextMonth} disabled={index === months.length - 1} className="nav-btn">→</button>
      </div>

      <div className="calendar-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="calendar-header-day">{d}</div>
        ))}

        {Array(firstDay).fill(null).map((_, i) => (
          <div key={i} className="calendar-cell empty" />
        ))}

        {Array(daysInMonth).fill(null).map((_, i) => {
  const date = new Date(year, month.getMonth(), i + 1);
  const dateStr = toDateStr(date);

  const completed = completedDates.includes(dateStr);
  const isToday = dateStr === todayStr;
  const isStart = dateStr === toDateStr(new Date(startDate));
  const isEnd = dateStr === toDateStr(new Date(endDate));

  return (
    <div
      key={dateStr}
      className={`calendar-cell
        ${completed ? "completed" : ""}
        ${isToday ? "today" : ""}
        ${isStart ? "start" : ""}
        ${isEnd ? "end" : ""}
      `}
      data-tooltip={
        isStart ? "Start Date" :
        isEnd ? "End Date" :
        completed ? "Completed" : "Not Completed"
      }
    >
      {i + 1}
      {completed && <span className="tick">✔</span>}
    </div>
  );
})}

      </div>
    </div>
  );
}
