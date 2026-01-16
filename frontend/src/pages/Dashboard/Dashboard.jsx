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

export default function Dashboard() {
  const { user } = useAuth();
  const [last7Days, setLast7Days] = useState([]);
  const [latest, setLatest] = useState(null);
  const [initialWeight, setInitialWeight] = useState(null);
  const [activeMealPlan, setActiveMealPlan] = useState(null);
  const [completedDates, setCompletedDates] = useState([]);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      // 1️⃣ Get initial profile weight
      const profile = await getProfileByUserId(user.id);
      setInitialWeight(profile.weight);

      // 2️⃣ Get active meal plan
      const mealPlanRes = await getLatestMealPlan(user.id);
      const mealPlan = mealPlanRes?.mealPlan || null;
      setActiveMealPlan(mealPlan); // ✅ Save to state
      console.log("Active Meal Plan:", mealPlanRes.mealPlan);

      // 3️⃣ Get completed progress dates
      if (mealPlan?._id) {
        const completedRes = await getCompletedProgressDates(
          user.id,
          mealPlan._id
        );
        setCompletedDates(completedRes);
        console.log("Completed Dates:", completedRes);
      }

      // 4️⃣ Get last 7 days progress
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
    };

    loadDashboard();
  }, [user]);

  return (
    <>
      <Header />
      <div className="dashboard-root">
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

          {/* Progress Calendar */}

          {activeMealPlan && (
            <ProgressCalendar
              startDate={activeMealPlan.startDate}
              endDate={activeMealPlan.endDate}
              completedDates={completedDates}
            />
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
