import { useEffect, useState } from "react";
import "./FeedbackList.css";
import {
  getAllFeedback,
  getMealFeedback,
  getWorkoutFeedback,
} from "../api/planFeedbackApi.js";

const FeedbackList = ({  userId, userProfileId, type = "all" }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        let response;
        if (type === "meal") {
          response = await getMealFeedback(userProfileId);
        } else if (type === "workout") {
          response = await getWorkoutFeedback(userProfileId);
        } else {
          response = await getAllFeedback(userProfileId);
        }

        setFeedbacks(response.data || []);
      } catch {
        setError("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    if (userId && userProfileId) fetchFeedback();
  }, [userId, userProfileId, type]);

  const formatDate = (date) =>
    new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <p className="feedback-loading">Loading feedback...</p>;
  if (error) return <p className="feedback-error">{error}</p>;
  if (!feedbacks.length)
    return <p className="feedback-empty">No feedback available</p>;

  return (
    <div className="feedback-grid-wrapper">
      <div className="feedback-container">
        {feedbacks.map((fb) => (
          <div key={fb._id} className="feedback-card">
            {/* Header */}
            <div className="feedback-header">
              <span className={`badge ${fb.planType}`}>
                {fb.planType === "meal" ? "Meal Plan" : "Workout Plan"}
              </span>
            </div>

            {/* Body */}
            <div className="feedback-body">
              <div className="feedback-row">
                <span className="feedback-label">Reason:</span>
                <span className="feedback-value">{fb.reason}</span>
              </div>

              <div className="feedback-row">
                <span className="feedback-label">Created At:</span>
                <span className="feedback-date-value">
                  {formatDate(fb.createdAt)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="feedback-plan">
              <span className="plan-label">
                {fb.planType === "meal" ? "Meal Plan" : "Workout Plan"}
              </span>
              <span className="plan-name">
                {fb.planType === "meal"
                  ? fb.mealPlan_id?.name || "Deleted / Old Plan"
                  : fb.workoutPlan_id?.name || "Deleted / Old Plan"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;
