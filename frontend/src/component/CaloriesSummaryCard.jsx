import { FaFireAlt, FaAppleAlt } from "react-icons/fa";
import "./CaloriesSummaryCard.css";

export default function CaloriesSummaryCard({ taken = 0, burned = 0 }) {
  return (
    <div className="calories-summary-card">
      <div className="calories taken">
        <FaAppleAlt className="icon-taken" />
        <div>
          <div className="value">{taken}</div>
          <div className="label">Calories Taken</div>
        </div>
      </div>

      <div className="calories burned">
        <FaFireAlt className="icon-burned" />
        <div>
          <div className="value">{burned}</div>
          <div className="label">Calories Burned</div>
        </div>
      </div>
    </div>
  );
}
