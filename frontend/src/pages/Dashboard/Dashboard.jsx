import { useEffect, useState } from "react";
import "./Dashboard.css";
import StatCard from "../../component/Dashboard/StatCard";
import ActivityPanel from "../../component/Dashboard/ActivityPanel.jsx";
import ProgressCalendar from "../../component/Dashboard/ProgressCalender";
import { useAuth } from "../../context/authContext";
import {
  getDailyProgressByDate,
  getCompletedProgressDates,
  checkDailyProgressForUser,
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

  const [latest, setLatest] = useState(null);
  const [initialWeight, setInitialWeight] = useState(null);
  const [activeMealPlan, setActiveMealPlan] = useState(null);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [progressMealPlanExists, setProgressMealPlanExists] = useState(false);
  const [progressWorkoutPlanExists, setProgressWorkoutPlanExists] =
    useState(false);
  const [completedDates, setCompletedDates] = useState({
    meal: [],
    workout: [],
  });
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);

  const [totalCaloriesTaken, setTotalCaloriesTaken] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        /** ================= PROFILE ================= */
        const profile = await getProfileByUserId();

        if (!profile?._id) {
          setProfileExists(false);
          setTimeout(() => (window.location.href = "/home"), 3000);
          return;
        }

        setProfileExists(true);
        setInitialWeight(profile.weight);

        /** ================= PLANS ================= */
        const mealPlanRes = await getLatestMealPlan();
        const workoutPlanRes = await getWorkoutPlanDetails();

        const mealPlan = mealPlanRes?.mealPlan || null;
        const workoutPlan = workoutPlanRes?.workoutPlan || null;

        setActiveMealPlan(mealPlan);
        setActiveWorkoutPlan(workoutPlan);

        if (!mealPlan && !workoutPlan) {
          setTimeout(() => (window.location.href = "/home"), 3000);
          return;
        }

        /** ================= PROGRESS STATUS ================= */
        const progressCheck = await checkDailyProgressForUser();

        setProgressMealPlanExists(
          progressCheck?.mealPlan?.progressExists ?? false,
        );
        setProgressWorkoutPlanExists(
          progressCheck?.workoutPlan?.progressExists ?? false,
        );

        /** ================= COMPLETED DATES ================= */
        const completedRes = await getCompletedProgressDates();

        setCompletedDates({
          meal: completedRes?.mealCompletedDates || [],
          workout: completedRes?.workoutCompletedDates || [],
        });

        /** ================= DATE RANGE ================= */
        const mealStart = mealPlan?.startDate
          ? new Date(mealPlan.startDate)
          : null;

        const mealEnd = mealPlan?.endDate ? new Date(mealPlan.endDate) : null;

        const workoutStart = workoutPlan?.startDate
          ? new Date(workoutPlan.startDate)
          : null;

        const workoutEnd = workoutPlan?.endDate
          ? new Date(workoutPlan.endDate)
          : null;

        const finalStart =
          mealStart && workoutStart
            ? new Date(Math.min(mealStart, workoutStart))
            : mealStart || workoutStart;

        const finalEnd =
          mealEnd && workoutEnd
            ? new Date(Math.max(mealEnd, workoutEnd))
            : mealEnd || workoutEnd;

        const startDate =
          finalStart ||
          (() => {
            const d = new Date();
            d.setDate(d.getDate() - 6);
            return d;
          })();

        const today = new Date();
        const endDate = finalEnd && finalEnd < today ? finalEnd : today;

        /** ================= DAILY PROGRESS ================= */
        const days = [];

        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const dateStr = d.toISOString().split("T")[0];
          const res = await getDailyProgressByDate(dateStr);

          days.push({
            date: dateStr,
            progress: res?.progress || null,
          });
        }

        /** ================= TOTALS ================= */
        const lastValidProgress =
          [...days].reverse().find((d) => d.progress)?.progress || null;

        const totalTaken = days.reduce(
          (sum, d) => sum + (d.progress?.totalCaloriesTaken || 0),
          0,
        );

        const totalBurned = days.reduce(
          (sum, d) => sum + (d.progress?.totalCaloriesBurned || 0),
          0,
        );

        setLatest(lastValidProgress);
        setTotalCaloriesTaken(totalTaken);
        setTotalCaloriesBurned(totalBurned);
        console.log("last valid", lastValidProgress);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);
  const getLastProgressSummary = () => {
    if (!latest) return null;

    const meals = latest.meals || [];
    const workouts = latest.workouts || [];

    const mealSummary = {
      Breakfast: "Skipped",
      Lunch: "Skipped",
      Snack: "Skipped",
      Dinner: "Skipped",
    };

    meals.forEach((meal) => {
      const name = meal.items?.[0]?.name || "Skipped";
      mealSummary[meal.mealType] = name || "Skipped";
    });

    const workoutSummary =
      workouts.length > 0 ? workouts.map((w) => w.name) : ["Skipped"];

    return { mealSummary, workoutSummary, date: latest.date };
  };
  const lastProgress = getLastProgressSummary();

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
              value={totalCaloriesTaken || "--"}
              className="green"
            />

            <StatCard
              icon="🔥"
              title="Calories Burned"
              value={totalCaloriesBurned || "--"}
              className="orange"
            />
          </div>

          {/* COLUMN 3 */}
          
         
            <div className="calendar-col">
              <ProgressCalendar
                mealStart={activeMealPlan.startDate}
                mealEnd={activeMealPlan.endDate}
                workoutStart={activeWorkoutPlan.startDate}
                workoutEnd={activeWorkoutPlan.endDate}
                completedMeals={completedDates.meal}
                completedWorkouts={completedDates.workout}
              />
             
            
             <div className="plan-card">
    <h3>Hi, {user?.username}!</h3>

    {!lastProgress ? (
      <p>No recent progress found.</p>
    ) : (
      <>
        <p className="card-date">
          Last progress: {new Date(lastProgress.date).toDateString()}
        </p>

        <div className="meal-summary">
          <p><b>Breakfast:</b> {lastProgress.mealSummary.Breakfast}</p>
          <p><b>Lunch:</b> {lastProgress.mealSummary.Lunch}</p>
          <p><b>Snack:</b> {lastProgress.mealSummary.Snack}</p>
          <p><b>Dinner:</b> {lastProgress.mealSummary.Dinner}</p>
        </div>

        <div className="workout-summary">
          <p><b>Workout:</b> {lastProgress.workoutSummary.join(", ")}</p>
        </div>
      </>
    )}
  </div>
 </div>

    </div>
          
        
        {/* ===== ROW 3: GRAPHS ===== */}

        <section className="activities">
          <ActivityPanel
            title="Workout Adherence"
            subtitle="Workout plan progress"
            type="workout"
            progressStatus={{
              meal: progressMealPlanExists,
              workout: progressWorkoutPlanExists,
            }}
          />

          <ActivityPanel
            title="Meal Adherence"
            subtitle="Meal plan progress"
            type="meal"
            progressStatus={{
              meal: progressMealPlanExists,
              workout: progressWorkoutPlanExists,
            }}
          />

          <ActivityPanel
            title="Calories"
            subtitle="Taken vs Burned"
            type="calories"
            progressStatus={{
              meal: progressMealPlanExists,
              workout: progressWorkoutPlanExists,
            }}
          />
        </section>
      </main>
    </div>
  );
}
