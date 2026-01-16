import "./StatCard.css";

export default function StatCard({ icon, title, value, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <span className="icon">{icon}</span>
      <div>
        <h2>{value}</h2>
        <p>{title}</p>
      </div>
    </div>
  );
}
