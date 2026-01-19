import { useEffect, useState } from "react";
import "./Dashboard.css";
import StatCard from "../../component/Dashboard/StatCard";
import ActivityCard from "../../component/Dashboard/ActivityCard";
import ProgressCalendar from "../../component/Dashboard/ProgressCalender";
import { useAuth } from "../../context/authContext";
import {
  getDailyProgressByDate,
  getCompletedProgressDates,
} from "../../api/dailyProgress";
import { getProfileByUserId } from "../../api/userProfileApi";
import { getLatestMealPlan } from "../../api/mealPlanApi";
import { getLatestWorkoutPlan } from "../../api/workoutPlan";
import Loading from "../../component/Loading";
import PageHeader from "../../component/PageHeader.jsx";
import ProgressPercentage from "../../component/ProgressPercentage.jsx";

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

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const profile = await getProfileByUserId();
        if (!profile?._id) {
          setProfileExists(false);
          setTimeout(() => (window.location.href = "/home"), 3000);
        }
        setProfileExists(true);
        setInitialWeight(profile.weight);

        const mealPlanRes = await getLatestMealPlan();
        const mealPlan = mealPlanRes?.mealPlan || null;
        setActiveMealPlan(mealPlan);

        const workoutPlanRes = await getLatestWorkoutPlan(user.id);
        const workoutPlan = workoutPlanRes?.workoutPlan || null;
        setActiveWorkoutPlan(workoutPlan);
        

        if (!mealPlan && !workoutPlan) {
          setTimeout(() => (window.location.href = "/home"), 3000);
        } else if (!mealPlan && workoutPlan) {
          setTimeout(() => (window.location.href = "/dietPlan"), 3000);
        }

        else if (!workoutPlan && mealPlan) {
          setTimeout(() => (window.location.href = "/workouts"), 3000);
        }

        else if (mealPlan?._id) {
          const completedRes = await getCompletedProgressDates(mealPlan._id);
          setCompletedDates(completedRes);
          console.log("completeRes", completedRes);
        }

console.log("workout start date",activeMealPlan.startDate); 
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const res = await getDailyProgressByDate(dateStr);
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

  if (!activeMealPlan && !activeWorkoutPlan) {
    return (
      <div className="app-container">
        <p className="simple-message">
          No active plans found. Redirecting to home...
        </p>
      </div>
    );
  }

  if (activeWorkoutPlan && !activeMealPlan) {
    return (
      <div className="app-container">
        <p className="simple-message">
          No active meal plan found. Redirecting to meal plan...
        </p>
      </div>
    );
  }

  if (activeMealPlan && !activeWorkoutPlan) {
    return (
      <div className="app-container">
        <p className="simple-message">
          No active workout plan found. Redirecting to workout plan...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <main className="dashboard-main">
        {/* ===== ROW 1: HEADER ===== */}
        <div className="dashboard-header">
          <PageHeader
            icon="👋"
            title={`Hey ${user?.username}!`}
            subtitle="Let's start living healthy from today"
          />
        </div>

        {/* ===== ROW 2: GRID ===== */}
        <div className="dashboard-top-grid">
          {/* COLUMN 1 */}
          <div className="progress-col">
            <ProgressPercentage />
          </div>

          {/* COLUMN 2 */}
          <div className="stats-col">
            <StatCard
              icon="⚖️"
              title="Initial Weight"
              value={`${initialWeight ?? "--"} kg`}
              className="pink"
            />
            <StatCard
              icon="💪"
              title="Current Weight"
              value={`${latest?.weight ?? "--"} kg`}
              className="blue"
            />
            <StatCard
              icon="🍽️"
              title="Calories Taken"
              value={latest?.totalCaloriesTaken ?? "--"}
              className="green"
            />
            <StatCard
              icon="🔥"
              title="Calories Burned"
              value={latest?.totalCaloriesBurned ?? "--"}
              className="orange"
            />
          </div>

          {/* COLUMN 3 */}
          {activeMealPlan && (
            <div className="calendar-col">
              <ProgressCalendar
                startDate={activeMealPlan.startDate}
                endDate={activeMealPlan.endDate}
                completedDates={completedDates}
              />
            </div>
          )}
        </div>

        {/* ===== ROW 3: GRAPHS ===== */}
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
      </main>
    </div>
  );
}
