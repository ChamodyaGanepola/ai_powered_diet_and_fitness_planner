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
export default function Dashboard() {
  const { user } = useAuth();
  const [last7Days, setLast7Days] = useState([]);
  const [latest, setLatest] = useState(null);
  const [initialWeight, setInitialWeight] = useState(null);
  const [activeMealPlan, setActiveMealPlan] = useState(null);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [completedDates, setCompletedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const profile = await getProfileByUserId();
        if (!profile?._id) {
          window.location.href = "/home";
          return;
        }

        setInitialWeight(profile.weight);

        const mealPlanRes = await getLatestMealPlan();
        const mealPlan = mealPlanRes?.mealPlan || null;
        setActiveMealPlan(mealPlan);

        const workoutPlanRes = await getLatestWorkoutPlan(user.id);
        const workoutPlan = workoutPlanRes?.workoutPlan || null;
        setActiveWorkoutPlan(workoutPlan);

        if (!mealPlan && !workoutPlan) {
          window.location.href = "/home";
          return;
        }

        if (!mealPlan && workoutPlan) {
          window.location.href = "/dietplan";
          return;
        }

        if (!workoutPlan && mealPlan) {
          window.location.href = "/workouts";
          return;
        }

        if (mealPlan?._id) {
          const completedRes = await getCompletedProgressDates(mealPlan._id);
          setCompletedDates(completedRes);
        }

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

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-root">
      <main className="dashboard-main">
  
        <PageHeader
          icon="👋"
          title={`Hey ${user?.username}!`}
          subtitle="Your progress is looking great. Keep going!"
        />
        

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
    </div>
  );
}
