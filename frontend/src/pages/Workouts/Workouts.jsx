import { useState, useEffect } from "react";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import WorkoutCard from "../../component/WorkoutCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import {
  getLatestWorkoutPlan,
  createWorkoutPlan,
  updateWorkoutPlanStatus,
} from "../../api/workoutPlan.js";
import "./Workouts.css";

export default function Workout() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activeWorkoutPlanId, setActiveWorkoutPlanId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  const fetchWorkoutPlans = async () => {
    setLoading(true);
    try {
      const res = await getLatestWorkoutPlan(user.id);

      if (res.success && res.workoutPlan?.length) {
        const grouped = res.workoutPlan.reduce((acc, w) => {
          const planId = w.workoutplan_id;
          if (!acc[planId]) acc[planId] = [];
          acc[planId].push(w);
          return acc;
        }, {});

        const plansArr = Object.keys(grouped).map((planId) => ({
          _id: planId,
          workouts: grouped[planId],
        }));

        setPlans(plansArr);
        setActiveWorkoutPlanId(plansArr[0]._id);
      } else {
        setPlans([]);
        setActiveWorkoutPlanId(null);
      }
    } catch (err) {
      console.error("Error fetching workout plans:", err);
      setPlans([]);
      setActiveWorkoutPlanId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWorkoutPlan = async () => {
    try {
      setLoading(true);
      await createWorkoutPlan({ user_id: user.id });
      await fetchWorkoutPlans();
    } catch (err) {
      console.error("Failed to generate workout plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkoutPlan = async () => {
    if (!activeWorkoutPlanId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout plan?"
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await updateWorkoutPlanStatus(activeWorkoutPlanId, "not-suitable");
      await fetchWorkoutPlans();
    } catch (err) {
      console.error("Failed to delete workout plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="workouts-page">
        {loading ? (
          <p className="loading-text">Loading workout plans...</p>
        ) : plans.length === 0 ? (
          <div className="no-plan-wrapper">
            <h1 className="no-plan-greeting">Hey {user.username},</h1>
            <p className="no-plan-text">
              No workout plan for you. You can generate one based on your profile.
            </p>
            <button
              className="add-button"
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
                0
              );
              const totalCalories = workouts.reduce(
                (sum, w) => sum + (w.caloriesBurned || 0),
                0
              );

              return (
                <div key={plan._id} className="plan-card">
                  <div className="plan-header">
                    <h2>Workout Plan</h2>
                    <div className="plan-summary">
                      <span>Total Duration: {totalDuration} min</span>
                      <span>Total Calories: {totalCalories} kcal</span>
                    </div>
                  </div>

                  <div className="workouts-grid">
                    {workouts.map((w) => (
                      <WorkoutCard key={w._id} workout={w} />
                    ))}
                  </div>

                  <div className="delete-wrapper">
                    <button
                      className="delete-button"
                      onClick={handleDeleteWorkoutPlan}
                      disabled={loading}
                    >
                      Delete Workout Plan
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
