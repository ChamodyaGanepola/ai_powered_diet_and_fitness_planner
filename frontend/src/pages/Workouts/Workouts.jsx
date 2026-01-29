import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkoutCard from "../../component/WorkoutCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import {
  getLatestWorkoutPlan,
  updateWorkoutPlanStatus,
  createWorkoutPlan,
  getCompletedWorkoutPlans,
} from "../../api/workoutPlan.js";
import { FaTrash } from "react-icons/fa";
import { getProfileByUserId } from "../../api/userProfileApi.js";
import "./Workouts.css";
import { submitPlanFeedback } from "../../api/planFeedbackApi.js";
import PlanFeedbackModal from "../../component/PlanFeedbackModal.jsx";
import FeedbackList from "../../component/FeedbackList.jsx";
import PageHeader from "../../component/PageHeader";
import Loading from "../../component/Loading.jsx";
import { FaDumbbell } from "react-icons/fa";
import { useAlert } from "../../context/alertContext.jsx";
import { createNotification } from "../../api/notificationApi.js";

export default function Workout() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [profileExists, setProfileExists] = useState(true);
  const [userProfileId, setUserProfileId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFeedbackList, setShowFeedbackList] = useState(false);
  const [completedWorkoutPlans, setCompletedWorkoutPlans] = useState([]);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const res = await getProfileByUserId();

      if (!res) {
        setProfileExists(false);
        setLoading(false);
        setTimeout(() => navigate("/home"), 2000);
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
      // 🔹 ACTIVE PLAN (already exists)
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

      // 🔹 COMPLETED WORKOUT PLANS (NEW)
      const completedRes = await getCompletedWorkoutPlans();

      if (completedRes.success) {
        setCompletedWorkoutPlans(completedRes.workoutPlans);
      } else {
        setCompletedWorkoutPlans([]);
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
      await createNotification(
        `Hi ${user.username}, you marked your current active workout plan as not suitable due to "${reason}" 😢`,
      );
      showAlert({
        type: "error",
        message: `${user.username}, you marked your current active workoutplan as not suitable.`,
        autoClose: true,
        duration: 3000,
      });
      fetchWorkoutPlans();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loading text="Loading dashboard..." />;

  if (!profileExists) {
    return (
      <div className="app-container">
        <p className="simple-message">
          Hey {user.username}, first create your profile. Redirecting to home...
        </p>
      </div>
    );
  }
  const hasActivePlan = plans.length > 0;
  /*else if (plans.length === 0) {
   return (
      <div className="app-container">
        <div className="empty-state">
          <p className="simple-message">
            No active workout plan available. You can generate one based on your
          profile.
          </p>
  
          <button className="generate-btn" onClick={handleGenerateWorkoutPlan}>
            Generate Workout Plan
          </button>
  
       
          <div className="feedback-section">
            <div
              className="feedback-header-toggle"
              onClick={() => setShowFeedbackList((prev) => !prev)}
            >
              <span className={`feedback-arrow ${showFeedbackList ? "open" : ""}`}>
                ▾
              </span>
  
              <h2 className="feedback-title">
                Your Previous Workout Plan Feedback.
              </h2>
            </div>
  
           
            <div className={`feedback-content ${showFeedbackList ? "show" : "hide"}`}>
              <FeedbackList
                userId={user.id}
                userProfileId={userProfileId}
                type="workout"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }*/

  
    return (
  <div className="workouts-page">
    {/* NO ACTIVE PLAN */}
    {!hasActivePlan && (
      <div className="workouts-inner">
        <div className="empty-state">
          <p>
            No active workout plan available. You can generate one based on your
            profile.
          </p>
          <button
            className="generate-btn"
            onClick={handleGenerateWorkoutPlan}
          >
            Generate Workout Plan
          </button>
        </div>
      </div>
    )}

    {/* ACTIVE PLAN */}
    {hasActivePlan && (
      <div className="workouts-inner">
        <PageHeader
          icon={<FaDumbbell />}
          title="Your Workout Plan"
          subtitle="Keep going, you’re doing great!"
        />

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

        <div className="delete-plan-wrapper">
          <button
            className="delete-button"
            onClick={handleDeleteWorkoutPlan}
            disabled={loading}
          >
            <FaTrash />
            Delete Workout Plan
          </button>
        </div>
      </div>
    )}

    {/* COMPLETED WORKOUT PLANS */}
    {completedWorkoutPlans.length > 0 && (
       <div className="workouts-inner">
      <div className="completed-workout-section">
        <h2 className="section-title">
          Your Previous Completed Workout Plans
        </h2>
        <div className="day-grid">
        {completedWorkoutPlans.map((plan) =>
          groupByDay(plan.exercises || []).map(({ day, workouts }) => (
            <section
              key={`${plan._id}-${day}`}
              className="day-section completed"
            >
              <h3 className="day-title">{day}</h3>

              <div className="workouts-grid">
                {workouts.map((w) => (
                  <WorkoutCard key={w._id} workout={w} completed />
                ))}
              </div>
            </section>
          ))
        )}
        </div>
      </div>
      </div>
    )}

    {/* FEEDBACK */}
    <div className="feedback-section">
      <div
        className="feedback-header-toggle"
        onClick={() => setShowFeedbackList((prev) => !prev)}
      >
        <span className={`feedback-arrow ${showFeedbackList ? "open" : ""}`}>
          ▾
        </span>

        <h2 className="feedback-title">
          Your Previous Workout Plan Feedback (Not suitable)
        </h2>
      </div>

      <div className={`feedback-content ${showFeedbackList ? "show" : "hide"}`}>
        <FeedbackList
          userId={user.id}
          userProfileId={userProfileId}
          type="workout"
        />
      </div>
    </div>

    <PlanFeedbackModal
      open={showFeedback}
      onCancel={() => setShowFeedback(false)}
      onConfirm={confirmWorkoutFeedback}
      title="Why is this workout plan not suitable?"
    />
  </div>
);
}