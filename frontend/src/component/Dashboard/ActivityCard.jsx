import "./ActivityCard.css";
import ActivityChart from "./ActivityChart";

export default function ActivityCard({ title, subtitle, type, data }) {
  return (
    <div className="activity-card">
      <h4>{title}</h4>
      <p>{subtitle}</p>
      <ActivityChart type={type} data={data} />
      <span className="avg">avg last week</span>
    </div>
  );
}
