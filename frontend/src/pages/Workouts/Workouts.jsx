import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import PageHeader from "../../component/PageHeader";
import Loading from "../../component/Loading.jsx";
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

  const checkUserProfile = async () => {
    try {
      const res = await getProfileByUserId();

      if (!res || !res._id) {
        setProfileExists(false);
        setLoading(false);
        setTimeout(() => navigate("/home"), 3000);
        return;
      }

      setUserProfileId(res._id);
      setProfileExists(true);
      fetchWorkoutPlans();
    } catch (err) {
      console.error(err);
      setProfileExists(false);
      setLoading(false);
      setTimeout(() => navigate("/home"), 3000);
    }
  };

  const fetchWorkoutPlans = async () => {
    setLoading(true);
    try {
      const res = await getLatestWorkoutPlan(user.id);

      if (res.success && res.workoutPlan?.length) {
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
      console.error(err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = (workouts) => {
    const daysOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const grouped = workouts.reduce((acc, w) => {
      const day = w.day || "Unassigned";
      if (!acc[day]) acc[day] = [];
      acc[day].push(w);
      return acc;
    }, {});

    const ordered = daysOrder
      .filter((d) => grouped[d])
      .map((d) => ({ day: d, workouts: grouped[d] }));

    if (grouped["Unassigned"]) {
      ordered.push({ day: "Unassigned", workouts: grouped["Unassigned"] });
    }

    return ordered;
  };

  const handleGenerateWorkoutPlan = async () => {
    try {
      await createWorkoutPlan();
      await fetchWorkoutPlans();
    } catch (err) {
      console.error(err);
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
      {loading && <Loading text="Loading workout plans..." />}
      {/* Header ONLY when plan exists */}
      {plans.length > 0 && (
        <PageHeader
          title="Your Workout Plan"
          subtitle="Keep going, you’re doing great!"
          icon={
            <img
              src="https://img.icons8.com/ios-filled/100/running.png"
              alt="running icon"
            />
          }
        />
      )}

      {!loading && !profileExists && (
        <div className="centered-card">
          <h2 className="greeting">Hey {user.username}</h2>
          <p className="no-plan-text">
            {" "}
            First create your profile. Redirecting to home...
          </p>
        </div>
      )}

      {!loading && profileExists && plans.length === 0 && (
        <div className="centered-card">
          <h2 className="greeting">No Workout Plan Yet</h2>
          <p className="no-plan-text">
            Generate a personalized workout plan based on your profile
          </p>
          <button className="generate-btn" onClick={handleGenerateWorkoutPlan}>
            Generate Workout Plan
          </button>
        </div>
      )}

{!loading && profileExists && plans.length > 0 && (
  <div className="day-grid">
    {plans.map((plan) =>
      groupByDay(plan.workouts || []).map(({ day, workouts }) => (
        <section key={day} className="day-section">
          <h3 className="day-title">{day}</h3>
          <div className="workouts-grid">
            {workouts.map((w) => (
              <WorkoutCard key={w._id} workout={w} />
            ))}
          </div>
        </section>
      ))
    )}
  </div>
)}




   {plans.length > 0 && (
  <div className="delete-plan-wrapper">
    <button
      className="delete-button"
      onClick={handleDeleteWorkoutPlan}
    >
      Delete Workout Plan
    </button>
  </div>
)}


      {/* Feedback Section */}
      {plans.length > 0 && (
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

          <div
            className={`feedback-content ${showFeedbackList ? "show" : "hide"}`}
          >
            <FeedbackList
              userId={user.id}
              userProfileId={userProfileId}
              type="workout"
            />
          </div>
        </div>
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
