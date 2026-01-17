import { useState, useEffect } from "react";
import "./PlanFeedbackModal.css";

export default function PlanFeedbackModal({
  open,
  onCancel,
  onConfirm,
  title = "Why is this plan not suitable?",
}) {
  const [reason, setReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-close when success changes
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        onCancel(); // actually close modal
      }, 2000);
      return () => clearTimeout(timer); // cleanup
    }
  }, [success, onCancel]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm(reason.trim()); // call parent handler
      setSuccess(true); // show success message
      setReason(""); // clear textarea
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-overlay">
      <div className="feedback-card">
       

        {!success ? (
          
          <>
           <h2>{title}</h2>
            <textarea
              placeholder="Type your feedback here..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />

            <div className="feedback-actions">
              <button
                className="btn-cancel"
                onClick={onCancel}
                disabled={loading }
              >
                Cancel
              </button>

              <button
                className="btn-confirm"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </>
        ) : (
          <div className="feedback-success">
            <p>✅ Feedback successfully recorded!</p>
          </div>
        )}
      </div>
    </div>
  );
}
