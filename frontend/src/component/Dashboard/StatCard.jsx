import { FaWeight, FaFire, FaUtensils, FaDumbbell } from "react-icons/fa";
import "./StatCard.css";

export default function StatCard({ stats, title, className }) {
  // Filter out missing stats
  const availableStats = stats.filter((s) => s.value !== null && s.value !== undefined);

  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card-inner">
        <h2>{title}</h2>

        {availableStats.length === 0 ? (
          <p className="no-stats">No stats available</p>
        ) : (
          <div className="stats-grid">
            {availableStats.map((s) => (
              <div className="stat-item" key={s.key}>
                <span className="icon-green">{s.icon}</span>
                <div>
                  <p className="stat-value">{s.value}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
