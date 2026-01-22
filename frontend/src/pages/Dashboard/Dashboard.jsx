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
import {
  getLatestWorkoutPlan,
  getWorkoutPlanDetails,
} from "../../api/workoutPlan";
import Loading from "../../component/Loading";
import PageHeader from "../../component/PageHeader.jsx";
import ProgressPercentage from "../../component/ProgressPercentage.jsx";
import { MdDashboard } from "react-icons/md";
export default function Dashboard() {
  const { user } = useAuth();
  const [last7Days, setLast7Days] = useState([]);
  const [latest, setLatest] = useState(null);
  const [initialWeight, setInitialWeight] = useState(null);
  const [activeMealPlan, setActiveMealPlan] = useState(null);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [completedDates, setCompletedDates] = useState({
    meal: [],
    workout: [],
  });
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
        console.log("Meal Plan", mealPlanRes);

        const workoutPlanRes = await getWorkoutPlanDetails();

        const workoutPlan = workoutPlanRes?.workoutPlan || null;
        setActiveWorkoutPlan(workoutPlan);
        console.log("Meal Plan start date", mealPlanRes.mealPlan.startDate);
        console.log("Meal Plan end date", mealPlanRes.mealPlan.endDate);
        console.log(
          "Workout Plan start date",
          workoutPlanRes.workoutPlan.startDate,
        );
        console.log(
          "Workout Plan end date",
          workoutPlanRes.workoutPlan.endDate,
        );
        if (!mealPlan && !workoutPlan) {
          setTimeout(() => (window.location.href = "/home"), 3000);
        } else if (!mealPlan && workoutPlan) {
          setTimeout(() => (window.location.href = "/dietPlan"), 3000);
        } else if (!workoutPlan && mealPlan) {
          setTimeout(() => (window.location.href = "/workouts"), 3000);
        } else if (mealPlan?._id) {
          const completedRes = await getCompletedProgressDates(mealPlan._id);

          setCompletedDates({
            meal: completedRes.mealCompletedDates || [],
            workout: completedRes.workoutCompletedDates || [],
          });
        }

        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          console.log("dateSTr", dateStr);
          const res = await getDailyProgressByDate(dateStr);
          console.log("getDailyProgress", res);
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
  } else if (!activeMealPlan && !activeWorkoutPlan) {
    return (
      <div className="app-container">
        <p className="simple-message">
          No active plans found. Redirecting to home...
        </p>
      </div>
    );
  } else if (activeWorkoutPlan && !activeMealPlan) {
    return (
      <div className="app-container">
        <p className="simple-message">
          No active meal plan found. Redirecting to meal plan...
        </p>
      </div>
    );
  } else if (activeMealPlan && !activeWorkoutPlan) {
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
            icon={<MdDashboard />}
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
                mealStart={activeMealPlan.startDate}
                mealEnd={activeMealPlan.endDate}
                workoutStart={activeWorkoutPlan.startDate}
                workoutEnd={activeWorkoutPlan.endDate}
                completedMeals={completedDates.meal}
                completedWorkouts={completedDates.workout}
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
