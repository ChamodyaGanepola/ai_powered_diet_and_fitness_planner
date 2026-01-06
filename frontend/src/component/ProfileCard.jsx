import { useState, useEffect } from "react";
import {
  createProfile,
  updateProfile,
  getProfileByUserId,
} from "../api/userProfileApi.js";
import "./ProfileCard.css";
import { useAuth } from "../context/authContext.jsx";

const ProfileCard = ({ onClose, edit = false }) => {
  const { user, markProfileUpdated } = useAuth();

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

  // Load existing profile if editing
  useEffect(() => {
    const fetchProfile = async () => {
      if (edit && user?.id) {
        setLoading(true);
        try {
          const data = await getProfileByUserId(user.id);
          if (data) {
            setFormData({
              age: data.age || "",
              gender: data.gender || "",
              weight: data.weight || "",
              height: data.height || "",
              fitnessGoal: data.fitnessGoal || "",
              activityLevel: data.activityLevel || "",
              dietaryRestrictions: data.dietaryRestrictions?.join(", ") || "",
              healthConditions: data.healthConditions?.join(", ") || "",
              preferences: data.preferences?.join(", ") || "",
              culturalDietaryPatterns:
                data.culturalDietaryPatterns?.join(", ") || "",
            });
          }
        } catch (err) {
          console.error("Failed to fetch profile", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [edit, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        user_id: user.id,
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
      };

      if (edit) {
        await updateProfile(user.id, payload);
      } else {
        await createProfile(payload);
      }

      setLoading(false);

      setSuccess(true);

      // 🔹 Trigger global profile refresh
      markProfileUpdated();

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Profile save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-card">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h2>
          👤 {edit ? "Edit Your Health Profile" : "Set Up Your Health Profile"}
        </h2>
        <p>
          Complete your profile to get personalized AI-powered diet and fitness
          plans
        </p>

        {loading && <p style={{ color: "var(--gray)" }}>Loading...</p>}

        <form className="profile-form" onSubmit={handleSubmit}>
          {/* Age & Gender */}
          <div className="form-row">
            <div className="form-group">
              <label>Age *</label>
              <input
                type="number"
                name="age"
                min="13"
                max="120"
                required
                value={formData.age}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Weight & Height */}
          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg) *</label>
              <input
                type="number"
                name="weight"
                min="0"
                required
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Height (cm) *</label>
              <input
                type="number"
                name="height"
                min="0"
                required
                value={formData.height}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Fitness Goal & Activity Level */}
          <div className="form-group">
            <label>Fitness Goal *</label>
            <select
              name="fitnessGoal"
              required
              value={formData.fitnessGoal}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Goal
              </option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Maintain Fitness">Maintain Fitness</option>
              <option value="Improve Endurance">Improve Endurance</option>
            </select>
          </div>

          <div className="form-group">
            <label>Activity Level *</label>
            <select
              name="activityLevel"
              required
              value={formData.activityLevel}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Level
              </option>
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
              value={formData.dietaryRestrictions}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Health Conditions</label>
            <input
              type="text"
              name="healthConditions"
              placeholder="Diabetes, BP"
              value={formData.healthConditions}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Food Preferences</label>
            <input
              type="text"
              name="preferences"
              placeholder="Spicy food, Low-carb, High-protein"
              value={formData.preferences}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Cultural Dietary Patterns</label>
            <input
              type="text"
              name="culturalDietaryPatterns"
              placeholder="Sri Lankan, Indian, Mediterranean"
              value={formData.culturalDietaryPatterns}
              onChange={handleChange}
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && (
            <p style={{ color: "green", fontWeight: 600 }}>
              Profile saved successfully!
            </p>
          )}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : edit
              ? "💾 Update Profile & Continue"
              : "💾 Save Profile & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCard;
