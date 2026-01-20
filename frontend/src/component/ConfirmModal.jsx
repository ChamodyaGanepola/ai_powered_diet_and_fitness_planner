import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./ConfirmModal.css";

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-card">
        <div className="confirm-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <div className="confirm-body">
          <p>{message}</p>
        </div>

        <div className="confirm-actions">
          <button className="cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm} disabled={loading}>
            {loading ? "Processing..." : (
              <>
                <FaCheck /> Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
