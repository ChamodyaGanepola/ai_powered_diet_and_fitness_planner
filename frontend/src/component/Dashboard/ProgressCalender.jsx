import React from "react";
import "./ProgressCalendar.css";

export default function ProgressCalendar({ startDate, endDate, completedDates = [] }) {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // UTC today

  const toUTCDateStr = (d) => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startStr = toUTCDateStr(start);
  const endStr = toUTCDateStr(end);
  const todayStr = toUTCDateStr(today);

  // Generate months between start and end
  const months = [];
  const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (current <= end) {
    months.push(new Date(current));
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  // Adaptive layout based on number of months
  const monthCount = months.length;
  let rowClass = "";
  if (monthCount === 1) rowClass = "one-month";
  else if (monthCount === 2) rowClass = "two-months";
  else if (monthCount === 3) rowClass = "three-months";
  else rowClass = "multi-months";

  return (
    <div className={`progress-calendar-wrapper ${rowClass}`}>
      {months.map((month) => {
        const year = month.getUTCFullYear();
        const monthIndex = month.getUTCMonth();
        const monthName = month.toLocaleString("default", { month: "short" });

        const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
        const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

        return (
          <div key={`${year}-${monthIndex}`} className="calendar-month">
            <div className="calendar-month-name">{monthName} {year}</div>
            <div className="calendar-grid">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="calendar-header">{d}</div>
              ))}

              {Array(firstDay).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-cell empty" />
              ))}

              {Array(daysInMonth).fill(null).map((_, i) => {
                const date = new Date(Date.UTC(year, monthIndex, i + 1));
                const dateStr = toUTCDateStr(date);

                const startCircle = dateStr === startStr;
                const endCircle = dateStr === endStr;
                const completed = completedDates.includes(dateStr);

                // Past days (from start) and today
                const isPast = date >= start && date < today;
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    className={`calendar-cell
                      ${startCircle ? "start" : ""}
                      ${endCircle ? "end" : ""}
                      ${completed ? "completed" : ""}
                      ${isPast ? "past" : ""}
                      ${isToday ? "today" : ""}
                    `}
                  >
                    {i + 1}
                    {completed && <span className="tick">✔</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
