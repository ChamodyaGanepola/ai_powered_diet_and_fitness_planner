import { useEffect, useState } from "react";
import "./Dashboard.css";
import StatCard from "../../component/Dashboard/StatCard";
import ActivityCard from "../../component/Dashboard/ActivityCard";
import ProgressCalendar from "../../component/Dashboard/ProgressCalender";
import Header from "../../component/Header";
import Footer from "../../component/Footer";
import { useAuth } from "../../context/authContext";
import {
  getDailyProgressByDate,
  getCompletedProgressDates,
} from "../../api/dailyProgress";
import { getProfileByUserId } from "../../api/userProfileApi";
import { getLatestMealPlan } from "../../api/mealPlanApi";
import { getLatestWorkoutPlan } from "../../api/workoutPlan"; // ✅ new import

export default function Dashboard() {
  const { user } = useAuth();
  const [last7Days, setLast7Days] = useState([]);
  const [latest, setLatest] = useState(null);
  const [initialWeight, setInitialWeight] = useState(null);
  const [activeMealPlan, setActiveMealPlan] = useState(null);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [completedDates, setCompletedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);
  const [mealPlanExists, setMealPlanExists] = useState(false);
  const [workoutPlanExists, setWorkoutPlanExists] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        // 1️⃣ Check user profile
        const profile = await getProfileByUserId(user.id);
        if (!profile || !profile._id) {
          setProfileExists(false);
          setTimeout(() => window.location.href = "/home", 3000);
          return;
        }
        setInitialWeight(profile.weight);

        // 2️⃣ Check meal plan
        const mealPlanRes = await getLatestMealPlan(user.id);
        const mealPlan = mealPlanRes?.mealPlan || null;
        setActiveMealPlan(mealPlan);
        setMealPlanExists(!!mealPlan);

        // 3️⃣ Check workout plan
        const workoutPlanRes = await getLatestWorkoutPlan(user.id);
        const workoutPlan = workoutPlanRes?.workoutPlan || null;
        setActiveWorkoutPlan(workoutPlan);
        setWorkoutPlanExists(!!workoutPlan);

        // 4️⃣ Redirect based on plans
        if (!mealPlan && !workoutPlan) {
          setTimeout(() => window.location.href = "/home", 3000);
        } else if (!mealPlan) {
          setTimeout(() => window.location.href = "/dietplan", 3000);
        } else if (!workoutPlan) {
          setTimeout(() => window.location.href = "/workouts", 3000);
        }

        // 5️⃣ Get completed dates (meal plan only)
        if (mealPlan?._id) {
          const completedRes = await getCompletedProgressDates(user.id, mealPlan._id);
          setCompletedDates(completedRes);
        }

        // 6️⃣ Last 7 days progress
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const res = await getDailyProgressByDate(user.id, dateStr);
          if (res.progress) days.push(res.progress);
        }

        setLast7Days(days);
        setLatest(days[days.length - 1]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  // ---------------- RENDER ----------------
  return (
   
      <div className="dashboard-root">
        {loading ? (
          <p className="loading-text">Loading dashboard...</p>
        ) : !profileExists ? (
          <div className="centered-card">
            <h2 className="greeting">
              Hey {user.username}, first create your profile
            </h2>
            <p className="no-plan-text">Redirecting to home...</p>
          </div>
        ) : (!mealPlanExists && !workoutPlanExists) ? (
          <div className="centered-card">
            <h2 className="greeting">No active plans found</h2>
            <p className="no-plan-text">Redirecting to home...</p>
          </div>
        ) : !mealPlanExists ? (
          <div className="centered-card">
            <h2 className="greeting">No active meal plan found</h2>
            <p className="no-plan-text">Redirecting to meal plan...</p>
          </div>
        ) : !workoutPlanExists ? (
          <div className="centered-card">
            <h2 className="greeting">No active workout plan found</h2>
            <p className="no-plan-text">Redirecting to workout plan...</p>
          </div>
        ) : (
          <main className="dashboard-main">
            <section className="welcome">
              <h3>Welcome Back,</h3>
              <h1>{user?.username}</h1>

              <div className="stats">
                <StatCard
                  icon="🎯"
                  title="Initial Weight"
                  value={initialWeight ? `${initialWeight} kg` : "--"}
                  color="blue"
                />
                <StatCard
                  icon="⚖️"
                  title="Current Weight"
                  value={latest ? `${latest.weight} kg` : "--"}
                  color="green"
                />
                <StatCard
                  icon="🔥"
                  title="Calories Taken"
                  value={latest?.totalCaloriesTaken ?? "--"}
                  color="orange"
                />
                <StatCard
                  icon="💪"
                  title="Calories Burned"
                  value={latest?.totalCaloriesBurned ?? "--"}
                  color="green"
                />
              </div>
            </section>

            <section className="activities">
              <ActivityCard
                title="Meal Adherence"
                subtitle="Last 7 days"
                type="meal"
                data={last7Days}
              />
              <ActivityCard
                title="Workout Adherence"
                subtitle="Last 7 days"
                type="workout"
                data={last7Days}
              />
              <ActivityCard
                title="Weight Trend"
                subtitle="Last 7 days"
                type="weight"
                data={last7Days}
              />
              <ActivityCard
                title="Calories"
                subtitle="Taken vs Burned"
                type="calories"
                data={last7Days}
              />
            </section>

            {activeMealPlan && (
              <ProgressCalendar
                startDate={activeMealPlan.startDate}
                endDate={activeMealPlan.endDate}
                completedDates={completedDates}
              />
            )}
          </main>
        )}
      </div>

  );
}
