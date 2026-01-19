import "./StatCard.css";

export default function StatCard({ icon, title, value, subtitle, className }) {
  return (
    <div className={`stat-card ${className}`}>
      <span className="icon">{icon}</span>
      <div>
        <h2>{value}</h2>
        {subtitle && <h3 className="subtitle">{subtitle}</h3>}
        <p>{title}</p>
      </div>
    </div>
  );
}
