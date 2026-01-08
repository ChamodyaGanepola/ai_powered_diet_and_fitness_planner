import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );
  };

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      setMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }
    try {
      setLoading(true);
      await resetPassword(token, { password, confirmPassword });
      alert("Password updated successfully");
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <p className="password-hint">
          Must be 8+ characters with uppercase, lowercase, number and symbol
        </p>

        {message && <p className="auth-message error">{message}</p>}

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating..." : "Confirm"}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
