import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import "./Alert.css";

const iconMap = {
  success: <FaCheckCircle />,
  error: <FaTimesCircle />,
  warning: <FaExclamationTriangle />,
  info: <FaInfoCircle />,
};

const colorMap = {
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const Alert = ({ type = "info", message, autoClose = false, duration = 4000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoClose) return;

    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoClose, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="alert" style={{ background: "#fff", borderColor: colorMap[type] }}>
      <span className="alert-icon" style={{ color: colorMap[type] }}>
        {iconMap[type]}
      </span>

      <span className="alert-message" style={{ color: colorMap[type] }}>
        {message}
      </span>

      <button
        className="alert-close"
        onClick={onClose}
        style={{ color: colorMap[type] }}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Alert;
