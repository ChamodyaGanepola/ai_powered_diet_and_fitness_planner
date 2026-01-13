import { useState, useEffect } from "react";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import WorkoutCard from "../../component/WorkoutCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { getLatestWorkoutPlan } from "../../api/workoutPlan.js";
import "./Workouts.css";

export default function Workout() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]); // array of plans
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  const fetchWorkoutPlans = async () => {
    setLoading(true);
    try {
      const res = await getLatestWorkoutPlan(user.id);

      if (res.success && res.workoutPlan?.length) {
        // GROUP workouts by workoutplan_id
        const grouped = res.workoutPlan.reduce((acc, workout) => {
          const planId = workout.workoutplan_id || "default";
          if (!acc[planId]) acc[planId] = [];
          acc[planId].push(workout);
          return acc;
        }, {});

        // Convert to array of plans
        const plansArr = Object.keys(grouped).map((planId) => ({
          _id: planId,
          workouts: grouped[planId],
        }));

        setPlans(plansArr);
      } else {
        setPlans([]); // no plans
      }
    } catch (err) {
      console.error("Error fetching workout plans:", err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="workouts-page">
        <h1>{user.username}, Your Workout Plans</h1>

        {loading ? (
          <p>Loading workout plans...</p>
        ) : plans.length === 0 ? (
          <p>No workout plans available.</p>
        ) : (
          plans.map((plan, pIdx) => {
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
              <div key={plan._id || pIdx} className="plan-card">
                <div className="plan-header">
                  <h2>Workout Plan #{pIdx + 1}</h2>
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
              </div>
            );
          })
        )}
      </div>
      <Footer />
    </>
  );
}
