import { useState, useEffect } from "react";
import {
  createProfile,
  updateProfile,
  getProfileByUserId,
} from "../api/userProfileApi.js";
import { createNotification } from "../api/notificationApi.js";
import { createMealPlan } from "../api/mealPlanApi.js";
import { createWorkoutPlan } from "../api/workoutPlan.js";
import { FaSave } from "react-icons/fa";
import "./ProfileCard.css";
import { useAuth } from "../context/authContext.jsx";
import { FaCheck } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import {
  validateAge,
  validateGender,
  validateWeight,
  validateHeight,
  validateFitnessGoal,
  validateActivityLevel,
  validateWorkoutPreference,
  validateDays,
} from "../utils/validation.js";
import ConfirmModal from "../component/ConfirmModal.jsx";
import Alert from "../component/Alert.jsx";
const ProfileCard = ({ onClose, edit = false }) => {
  const { user, markProfileUpdated } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    fitnessGoal: "",
    activityLevel: "",
    dietaryRestrictions: "",
    healthConditions: "",
    workoutPreferences: "",
    culturalDietaryPatterns: "",
    days: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [bmi, setBMI] = useState(null);
  const [bmiCategory, setBMICategory] = useState(null);

  const [step, setStep] = useState("form");
  const [planError, setPlanError] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (edit && user?.id) {
        setLoading(true);
        try {
          const data = await getProfileByUserId();
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
              workoutPreferences: data.workoutPreferences || "",
              culturalDietaryPatterns:
                data.culturalDietaryPatterns?.join(", ") || "",
              days: data.days || 0,
            });
            setBMI(data.bmi || null);
            setBMICategory(data.bmiCategory || null);
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

  const validateForm = () => {
    const newErrors = {};

    if (!validateAge(Number(formData.age)))
      newErrors.age = "Age must be between 13 and 120";
    if (!validateGender(formData.gender))
      newErrors.gender = "Please select a valid gender";
    if (!validateWeight(Number(formData.weight)))
      newErrors.weight = "Weight must be greater than 0";
    if (!validateHeight(Number(formData.height)))
      newErrors.height = "Height must be greater than 0";
    if (!validateFitnessGoal(formData.fitnessGoal))
      newErrors.fitnessGoal = "Fitness goal is required";
    if (!validateActivityLevel(formData.activityLevel))
      newErrors.activityLevel = "Activity level is required";
    if (!validateWorkoutPreference(formData.workoutPreferences))
      newErrors.workoutPreferences = "Please select a workout preference";
    if (!validateDays(formData.days))
      newErrors.days = "Please select valid days";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "days" ? Number(value) : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setConfirmOpen(true);
  };
  const handleConfirm = async () => {
    setConfirmOpen(false);

    setLoading(true);
    setError(null);
    setSuccess(false);
    setPlanError(null);

    const payload = {
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
      workoutPreferences: formData.workoutPreferences,
      culturalDietaryPatterns: formData.culturalDietaryPatterns
        ? formData.culturalDietaryPatterns.split(",").map((i) => i.trim())
        : [],
      days: formData.days,
    };

    try {
      let profile;
      const actionType = edit ? "updated" : "created";

      if (edit) {
        const res = await updateProfile(payload);
        profile = res.profile;
      } else {
        const res = await createProfile(payload);
        profile = res.profile;
      }

      setBMI(profile.bmi);
      setBMICategory(profile.bmiCategory);

      markProfileUpdated();

      /* ✅ SUCCESS ALERT */
      setAlert({
        type: "success",
        message:
          actionType === "created"
            ? "🎉 Profile created successfully!"
            : "✅ Profile updated successfully!",
        autoClose: true,
        duration: 3000,
      });

      await createNotification(
        `Hi ${user.username}, your profile has been successfully ${actionType}! 🙂`,
      );

      setStep("generating");

      try {
        await createMealPlan();
        await createWorkoutPlan();
        await createNotification("🍽️ Meal plan and 🏋️ Workout plan are ready!");
        setStep("done");
      } catch (err) {
        setPlanError("⚠️ Meal & Workout Plan generation failed.");
        setStep("failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Profile save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-card">
        {alert && (
  <Alert
    type={alert.type}
    message={alert.message}
    autoClose={alert.autoClose}
    duration={alert.duration}
    onClose={() => setAlert(null)}
  />
)}

        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        {step === "form" && (
          <>
            <h2 className="profile-card-icon">
              <FaUser />{" "}
              <span>
                {edit
                  ? "Edit Your Health Profile"
                  : "Set Up Your Health Profile"}
              </span>
            </h2>
            <p>
              Complete your profile, get personalized AI-powered diet & fitness
              plans
            </p>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Age <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="13"
                    max="120"
                    required
                    value={formData.age}
                    onChange={handleChange}
                  />
                  {errors.age && <p className="error-text">{errors.age}</p>}
                </div>

                <div className="form-group">
                  <label>
                    Gender <span className="required">*</span>
                  </label>
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
                  {errors.gender && (
                    <p className="error-text">{errors.gender}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Weight (kg) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    min="0"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                  />
                  {errors.weight && (
                    <p className="error-text">{errors.weight}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Height (cm) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    min="0"
                    required
                    value={formData.height}
                    onChange={handleChange}
                  />
                  {errors.height && (
                    <p className="error-text">{errors.height}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Fitness Goal <span className="required">*</span>
                  </label>
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
                  {errors.fitnessGoal && (
                    <p className="error-text">{errors.fitnessGoal}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Activity Level <span className="required">*</span>
                  </label>
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
                  {errors.activityLevel && (
                    <p className="error-text">{errors.activityLevel}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Workout Preferences <span className="required">*</span>
                  </label>
                  <select
                    name="workoutPreferences"
                    required
                    value={formData.workoutPreferences}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Workout Preference
                    </option>
                    <option value="Yoga">Yoga</option>
                    <option value="Gym">Gym</option>
                    <option value="Home Workouts">Home Workouts</option>
                    <option value="Walking">Walking</option>
                    <option value="Running">Running</option>
                    <option value="Cycling">Cycling</option>
                    <option value="Swimming">Swimming</option>
                  </select>
                  {errors.workoutPreferences && (
                    <p className="error-text">{errors.workoutPreferences}</p>
                  )}
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
              </div>
              {/* DAYS */}
              <div className="form-group days-group">
                <div className="days-row">
                  <label>
                    Number of days for your plan
                    <span className="required">*</span>
                  </label>

                  <select
                    name="days"
                    required
                    value={formData.days}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Days
                    </option>
                    <option value="0">AI Generated</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                  </select>
                </div>

                {errors.days && <p className="error-text">{errors.days}</p>}
              </div>
              <div className="form-row">
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
                  <label>Cultural Dietary Patterns</label>
                  <input
                    type="text"
                    name="culturalDietaryPatterns"
                    placeholder="Sri Lankan, Indian, Mediterranean"
                    value={formData.culturalDietaryPatterns}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <FaSave /> {edit ? "Update Profile" : "Save Profile"}
                  </>
                )}
              </button>
            </form>
          </>
        )}
        <ConfirmModal
          open={confirmOpen}
          title="Confirm Submission"
          message="Are you sure you want to submit your profile?"
          onConfirm={handleConfirm}
          onCancel={() => setConfirmOpen(false)}
          loading={loading}
        />

        {(step === "generating" || step === "done" || step === "failed") && (
          <div className="bmi-spinner-card">
            <h3 className="fa-check">
              <FaCheck />{" "}
              <span>
                {" "}
                Your BMI: <strong>{bmi}</strong>
              </span>
            </h3>
            <h4>
              Category: <strong>{bmiCategory}</strong>
            </h4>

            {step === "generating" && <div className="spinner"></div>}
            {step === "generating" && (
              <p>Generating your personalized Meal & Workout Plans...</p>
            )}

            {step === "done" && (
              <p>🎉 Your personalized Meal & Workout Plans are ready!</p>
            )}

            {step === "failed" && <p style={{ color: "red" }}>{planError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
