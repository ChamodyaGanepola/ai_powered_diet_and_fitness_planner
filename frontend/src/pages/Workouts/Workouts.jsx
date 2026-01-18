import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import WorkoutCard from "../../component/WorkoutCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import {
  getLatestWorkoutPlan,
  updateWorkoutPlanStatus,
  createWorkoutPlan,
} from "../../api/workoutPlan.js";
import { getProfileByUserId } from "../../api/userProfileApi.js";
import "./Workouts.css";
import { submitPlanFeedback } from "../../api/planFeedbackApi.js";
import PlanFeedbackModal from "../../component/PlanFeedbackModal.jsx";
import FeedbackList from "../../component/FeedbackList.jsx";
export default function Workout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileExists, setProfileExists] = useState(true);
  const [userProfileId, setUserProfileId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFeedbackList, setShowFeedbackList] = useState(false);
  useEffect(() => {
    checkUserProfile();
  }, []);

  // ✅ Check if user profile exists
  const checkUserProfile = async () => {
    try {
      const res = await getProfileByUserId(user.id);
      console.log("Profile check response:", res);

      if (!res || !res._id) {
        setProfileExists(false);
        setLoading(false);

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate("/home");
        }, 3000);

        return;
      }
      setUserProfileId(res._id);
      // Profile exists → fetch workout plans
      setProfileExists(true);
      fetchWorkoutPlans();
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfileExists(false);
      setLoading(false);
      setTimeout(() => {
        navigate("/home");
      }, 3000);
    }
  };

  const fetchWorkoutPlans = async () => {
    setLoading(true);
    try {
      const res = await getLatestWorkoutPlan(user.id);

      if (res.success && res.workoutPlan?.length) {
        // Group workouts by workoutplan_id
        const grouped = res.workoutPlan.reduce((acc, workout) => {
          const planId = workout.workoutplan_id || "default";
          if (!acc[planId]) acc[planId] = [];
          acc[planId].push(workout);
          return acc;
        }, {});

        const plansArr = Object.keys(grouped).map((planId) => ({
          _id: planId,
          workouts: grouped[planId],
        }));

        setPlans(plansArr);
        setActivePlanId(plansArr[0]?._id || null);
      } else {
        setPlans([]);
        setActivePlanId(null);
      }
    } catch (err) {
      console.error("Error fetching workout plans:", err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate workout plan
  const handleGenerateWorkoutPlan = async () => {
    try {
      await createWorkoutPlan({ user_id: user.id });
      await fetchWorkoutPlans();
    } catch (err) {
      console.error("Failed to generate workout plan:", err);
    }
  };

  const handleDeleteWorkoutPlan = () => {
    if (!activePlanId) return;
    setShowFeedback(true);
  };
  const confirmWorkoutFeedback = async (reason) => {
    try {
      await updateWorkoutPlanStatus(activePlanId, "not-suitable");

      await submitPlanFeedback({
        user_id: user.id,
        userProfile_id: userProfileId,
        planType: "workout",
        workoutPlan_id: activePlanId,
        reason,
      });

      fetchWorkoutPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (

      <div className="workouts-page">
        {loading ? (
          <p className="loading-text">Loading workout plans...</p>
        ) : !profileExists ? (
          <div className="centered-card">
            <h2 className="greeting">
              Hey {user.username}, first create your profile
            </h2>
            <p className="no-plan-text">Redirecting to home...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="centered-card">
            <h2 className="greeting">
              Hey {user.username}, no active workout plan
            </h2>
            <p className="no-plan-text">
              You can generate a workout plan according to your profile
            </p>
            <button
              className="generate-btn"
              onClick={handleGenerateWorkoutPlan}
              disabled={loading}
            >
              Generate Workout Plan
            </button>
          </div>
        ) : (
          <>
            {plans.map((plan) => {
              const workouts = plan.workouts || [];
              const totalDuration = workouts.reduce(
                (sum, w) => sum + (w.duration || 0),
                0,
              );
              const totalCalories = workouts.reduce(
                (sum, w) => sum + (w.caloriesBurned || 0),
                0,
              );

              return (
                <div key={plan._id} className="plan-card">
                  <div className="plan-header">
                    <h2>Workout Plan</h2>
                    <div className="plan-summary">
                      <span>Total Duration: {totalDuration} min</span>
                      <span>Total Calories Burned: {totalCalories} kcal</span>
                    </div>
                  </div>

                  <div className="workouts-grid">
                    {workouts.map((w) => (
                      <WorkoutCard key={w._id} workout={w} />
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="delete-wrapper">
              <button
                className="delete-button"
                onClick={handleDeleteWorkoutPlan}
                disabled={loading}
              >
                Delete Workout Plan
              </button>
            </div>
             {/* Workout Feedback Section */}
          <div className="feedback-section">
            <div
              className="feedback-header-toggle"
              onClick={() => setShowFeedbackList((prev) => !prev)}
            >
              <span
                className={`feedback-arrow ${showFeedbackList ? "open" : ""}`}
              >
                ▾
              </span>

              <h2 className="feedback-title">
                Your Previous Workout Plan Feedback (Not suitable)
              </h2>
            </div>

            {/* Collapsible content */}
            <div
              className={`feedback-content ${
                showFeedbackList ? "show" : "hide"
              }`}
            >
              <FeedbackList
                userId={user.id}
                userProfileId={userProfileId}
                type="workout"
              />
            </div>
          </div>
        </>
      )}

        <PlanFeedbackModal
          open={showFeedback}
          onCancel={() => setShowFeedback(false)}
          onConfirm={confirmWorkoutFeedback}
          title="Why is this workout plan not suitable?"
        />
      </div>

  );
}
