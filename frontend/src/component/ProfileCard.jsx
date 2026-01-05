import { useState } from "react";
import { createProfile } from "../api/userProfileApi.js";
import "./ProfileCard.css";
import { useAuth } from "../context/authContext.jsx";

const ProfileCard = ({ onClose }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    fitnessGoal: "",
    activityLevel: "",
    dietaryRestrictions: "",
    healthConditions: "",
    preferences: "",
    culturalDietaryPatterns: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createProfile({
        user_id: user.id, // MUST match backend
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        height: Number(formData.height),
        fitnessGoal: formData.fitnessGoal,
        activityLevel: formData.activityLevel,

        dietaryRestrictions: formData.dietaryRestrictions
          ? formData.dietaryRestrictions.split(",").map((i) => i.trim())
          : [],

        healthConditions: formData.healthConditions
          ? formData.healthConditions.split(",").map((i) => i.trim())
          : [],

        preferences: formData.preferences
          ? formData.preferences.split(",").map((i) => i.trim())
          : [],

        culturalDietaryPatterns: formData.culturalDietaryPatterns
          ? formData.culturalDietaryPatterns.split(",").map((i) => i.trim())
          : [],
      });

      setSuccess(true);

      // auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Profile creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-card">
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>👤 Set Up Your Health Profile</h2>
        <p>
          Complete your profile to get personalized AI-powered diet and fitness plans
        </p>



        <form className="profile-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>Age *</label>
              <input type="number" name="age" min="13" max="120" required onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" required defaultValue="" onChange={handleChange}>
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg) *</label>
              <input type="number" name="weight" min="0" required onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Height (cm) *</label>
              <input type="number" name="height" min="0" required onChange={handleChange} />
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="form-group">
            <label>Fitness Goal *</label>
            <select name="fitnessGoal" required defaultValue="" onChange={handleChange}>
              <option value="" disabled>Select Goal</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Maintain Fitness">Maintain Fitness</option>
              <option value="Improve Endurance">Improve Endurance</option>
            </select>
          </div>

          {/* Activity Level */}
          <div className="form-group">
            <label>Activity Level *</label>
            <select name="activityLevel" required defaultValue="" onChange={handleChange}>
              <option value="" disabled>Select Level</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
            </select>
          </div>

          {/* Optional fields */}
          <div className="form-group">
            <label>Dietary Restrictions</label>
            <input
              type="text"
              name="dietaryRestrictions"
              placeholder="Vegan, Gluten-free"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Health Conditions</label>
            <input
              type="text"
              name="healthConditions"
              placeholder="Diabetes, BP"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Food Preferences</label>
            <input
              type="text"
              name="preferences"
              placeholder="Spicy food, Low-carb, High-protein"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Cultural Dietary Patterns</label>
            <input
              type="text"
              name="culturalDietaryPatterns"
              placeholder="Sri Lankan, Indian, Mediterranean"
              onChange={handleChange}
            />
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "💾 Save Profile & Continue"}
          </button>
          {/* ERROR */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* SUCCESS */}
        {success && (
          <p style={{ color: "green", fontWeight: 600 }}>
            Profile saved successfully!
          </p>
        )}
        </form>
      </div>
    </div>
  );
};

export default ProfileCard;
