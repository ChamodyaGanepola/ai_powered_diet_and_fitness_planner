import { useState, useEffect } from "react";
import "./DailyProgress.css";
import { useAuth } from "../../context/authContext.jsx";
import {
  getExercisesByDate,
  getLatestWorkoutPlan,
} from "../../api/workoutPlan.js";
import { getLatestMealPlan } from "../../api/mealPlanApi.js";
import {
  getDailyProgressByDate,
  createDailyProgress,
  resetPlanDatesIfNoProgress,
  checkDailyProgressForUser,
  getCompletedProgressDates,
} from "../../api/dailyProgress.js";

import { getProfileByUserId } from "../../api/userProfileApi.js";
import PageHeader from "../../component/PageHeader.jsx";
import Loading from "../../component/Loading.jsx";

export default function DailyProgress() {
  const { user } = useAuth();
  const [profileExists, setProfileExists] = useState(true);
  const [mealPlanExists, setMealPlanExists] = useState(false);
  const [workoutPlanExists, setWorkoutPlanExists] = useState(false);

  const [completedDates, setCompletedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [date, setDate] = useState(formatDateUTC(new Date()));

  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [locked, setLocked] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(date);
  const [calculatedEndDate, setCalculatedEndDate] = useState(null);

  const [planStartDate, setPlanStartDate] = useState(null);
  const [planEndDate, setPlanEndDate] = useState(null);

  const [weight, setWeight] = useState("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState("");
  const [measurements, setMeasurements] = useState({
    chest: "",
    waist: "",
    hips: "",
  });

  const [plansChecked, setPlansChecked] = useState(false);

  function formatDateUTC(d) {
    const dateObj = new Date(d);
    return dateObj.toISOString().split("T")[0];
  }

  const isDateWithinPlan = (selected) => {
    if (!planStartDate || !planEndDate) return false;
    const today = formatDateUTC(new Date());
    return (
      selected >= planStartDate && selected <= planEndDate && selected <= today
    );
  };

  useEffect(() => {
    checkProfileAndPlans();
  }, []);

  const checkProfileAndPlans = async () => {
    try {
      setPlansChecked(false);

      const profileRes = await getProfileByUserId();
      if (!profileRes || !profileRes._id) {
        setProfileExists(false);
        setTimeout(() => {
          window.location.href = "/home";
        }, 3000);
        return;
      }

      const mealRes = await getLatestMealPlan();
      const workoutRes = await getLatestWorkoutPlan();

      const mealExists = !!mealRes?.mealPlan;
      const workoutExists = !!workoutRes?.workoutPlan;

      setMealPlanExists(mealExists);
      setWorkoutPlanExists(workoutExists);
      setPlansChecked(true);

      if (!mealExists && !workoutExists) {
        setTimeout(() => (window.location.href = "/home"), 3000);
      } else if (!mealExists) {
        setTimeout(() => (window.location.href = "/dietplan"), 3000);
      } else if (!workoutExists) {
        setTimeout(() => (window.location.href = "/workouts"), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      initDailyProgress();
    }
  };

  useEffect(() => {
    if (planStartDate && planEndDate) {
      loadDailyProgressForDate(selectedDate);
    }
  }, [selectedDate, planStartDate, planEndDate]);

  const loadDailyProgressForDate = async (dateObj) => {
    setLoading(true);
    const formattedDate = formatDateUTC(dateObj);

    try {
      const progressRes = await getDailyProgressByDate(formattedDate);

      if (progressRes.progress) {
        loadProgress(progressRes.progress);
        setLocked(true);
        setSuccessMessage(`✔ Progress already completed for ${formattedDate}`);
      } else {
        setLocked(false);
        setSuccessMessage("");
        await fetchPlans(formattedDate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = (progress) => {
    setMeals(progress.meals || []);
    setWorkouts(progress.workouts || []);
    setLocked(progress.completed || false);
    setWeight(progress.weight || "");
    setBodyFatPercentage(progress.bodyFatPercentage || "");
    setMeasurements(progress.measurements || { chest: "", waist: "", hips: "" });
  };

  const initDailyProgress = async () => {
    setLoading(true);
    try {
      const res = await checkDailyProgressForUser();

      if (res.exists) {
        if (res.mealPlan) {
          setPlanStartDate(formatDateUTC(res.mealPlan.startDate));
          setPlanEndDate(formatDateUTC(res.mealPlan.endDate));

          const completedRes = await getCompletedProgressDates(
            res.mealPlan.id,
            res.workoutPlan?.id
          );
          if (completedRes.success)
            setCompletedDates(completedRes.completedDates);
        } else if (res.workoutPlan) {
          setPlanStartDate(formatDateUTC(res.workoutPlan.startDate));
          setPlanEndDate(formatDateUTC(res.workoutPlan.endDate));

          const completedRes = await getCompletedProgressDates(
            null,
            res.workoutPlan.id
          );
          if (completedRes.success)
            setCompletedDates(completedRes.completedDates);
        }

        await fetchPlans();
        setShowStartDateModal(false);
      } else {
        setShowStartDateModal(true);
      }

      const progressRes = await getDailyProgressByDate(date);
      if (progressRes.progress) loadProgress(progressRes.progress);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateConfirm = async () => {
    setLoading(true);
    try {
      const resetRes = await resetPlanDatesIfNoProgress(selectedStartDate);
      if (resetRes.success) {
        if (resetRes.updatedPlans.mealPlan) {
          const meal = resetRes.updatedPlans.mealPlan;
          const start = formatDateUTC(meal.startDate);
          const end = formatDateUTC(meal.endDate);
          setPlanStartDate(start);
          setPlanEndDate(end);
          setCalculatedEndDate(end);
          setDate(start);
        }
        if (resetRes.updatedPlans.workoutPlan) {
          const workout = resetRes.updatedPlans.workoutPlan;
          const start = formatDateUTC(workout.startDate);
          const end = formatDateUTC(workout.endDate);
          setPlanStartDate(start);
          setPlanEndDate(end);
          setCalculatedEndDate(end);
          setDate(start);
        }
        await fetchPlans();
      } else {
        alert(resetRes.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowStartDateModal(false);
      setLoading(false);
    }
  };

  const fetchPlans = async (selectedDate = date) => {
    try {
      const [mealRes, workoutRes] = await Promise.all([
        getLatestMealPlan(),
        getExercisesByDate(selectedDate),
      ]);

      const mealData = (mealRes?.mealPlan?.meals || []).map((m) => ({
        mealType: m.mealType,
        items: (m.foods || []).map((f) => ({ ...f, selected: false })),
      }));
      setMeals(mealData);

      const workoutData = (workoutRes?.exercises || []).map((w) => ({
        name: w.name,
        targetMuscle: w.targetMuscle,
        sets: w.sets,
        reps: w.reps,
        caloriesBurned: w.caloriesBurned,
        duration: w.durationMinutes,
      }));
      setWorkouts(workoutData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMealSelection = (mealIdx, itemIdx) => {
    const newMeals = [...meals];
    newMeals[mealIdx].items = newMeals[mealIdx].items.map((item, idx) => ({
      ...item,
      selected: idx === itemIdx,
    }));
    setMeals(newMeals);
  };

  const handleWorkoutChange = (idx, key, value) => {
    const newWorkouts = [...workouts];
    if (["sets", "caloriesBurned", "duration"].includes(key))
      value = Number(value);
    newWorkouts[idx][key] = value;
    setWorkouts(newWorkouts);
  };

  const submitDay = async () => {
    if (
      !weight ||
      !bodyFatPercentage ||
      !measurements.chest ||
      !measurements.waist ||
      !measurements.hips
    ) {
      alert("Please fill all body metrics before submitting.");
      return;
    }
    if (!window.confirm("Are you sure you want to submit? You can't edit again!"))
      return;

    try {
      await createDailyProgress(
        formatDateUTC(selectedDate),
        weight,
        bodyFatPercentage,
        measurements,
        meals,
        workouts
      );

      setLocked(true);
      setSuccessMessage(`✔ Progress saved successfully for ${formatDateUTC(selectedDate)}!`);
      setCompletedDates((prev) => [...prev, formatDateUTC(selectedDate)]);
    } catch (err) {
      console.error(err);
      alert("Failed to save progress.");
    }
  };

  const totalMacros = meals.reduce(
    (acc, meal) => {
      const selected = meal.items.find((i) => i.selected);
      if (selected) {
        acc.calories += selected.calories || 0;
        acc.protein += selected.protein || 0;
        acc.fat += selected.fat || 0;
        acc.carbs += selected.carbohydrates || 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const dateValid = isDateWithinPlan(date);

  // ------------------------- RENDER -------------------------
  if (!profileExists) {
    return (
      <div className="app-container">
        <p className="simple-message">
          Hey {user.username}, first create your profile. Redirecting to home...
        </p>
      </div>
    );
  }
 if (loading) {
    return <Loading text="Loading Progress..." />;
  }
  if (!plansChecked) {
    return <Loading text="Loading Plans..." />;
  }

  if (plansChecked && !mealPlanExists && !workoutPlanExists) {
    return (
      <div className="app-container">
        <p className="simple-message">
          No active plans found. Redirecting to home...
        </p>
      </div>
    );
  }

  if (plansChecked && !mealPlanExists) {
    return (
      <div className="app-container">
        <p className="simple-message">
          No active meal plan found. Redirecting to meal plan...
        </p>
      </div>
    );
  }

  if (plansChecked && !workoutPlanExists) {
    return (
      <div className="app-container">
        <p className="simple-message">
          No active workout plan found. Redirecting to workout plan...
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <PageHeader
        icon="👋"
        title="Daily Progress Tracker"
        subtitle="Track your progress daily — stay consistent."
      />

      <div className="progress-page">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedDate(new Date(e.target.value));
          }}
          className="date-picker"
          min={planStartDate || undefined}
          max={
            planEndDate
              ? planEndDate > formatDateUTC(new Date())
                ? formatDateUTC(new Date())
                : planEndDate
              : formatDateUTC(new Date())
          }
          disabled={!planStartDate || !planEndDate}
        />

        {loading && <Loading text="Loading Progress Tracker..." />}

        {showStartDateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Select Start Date for Your Meal & Workout Plans</h3>
              <input
                type="date"
                value={selectedStartDate}
                onChange={(e) => {
                  setSelectedStartDate(e.target.value);
                  const start = new Date(e.target.value);
                  const end = new Date(start);
                  end.setDate(end.getDate() + 7 - 1);
                  setCalculatedEndDate(formatDateUTC(end));
                }}
              />
              {calculatedEndDate && (
                <p>
                  Calculated End Date: <strong>{calculatedEndDate}</strong>
                </p>
              )}
              <div className="modal-buttons">
                <button onClick={handleStartDateConfirm}>Confirm</button>
                <button onClick={() => setShowStartDateModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !showStartDateModal && (
          <>
            {!dateValid ? (
              <p className="invalid-date-msg">
                No progress available for this date.
              </p>
            ) : (
              <>
                {locked ? (
                  <p className="done">{successMessage}</p>
                ) : (
                  <>
                    {/* BODY METRICS */}
                    <div className="section body-section">
                      <h3>Body Metrics</h3>
                      <div className="body-grid">
                        <div className="body-field">
                          <label>Weight (kg)</label>
                          <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                          />
                        </div>
                        <div className="body-field">
                          <label>Body Fat (%)</label>
                          <input
                            type="number"
                            value={bodyFatPercentage}
                            onChange={(e) =>
                              setBodyFatPercentage(e.target.value)
                            }
                          />
                        </div>
                        <div className="body-field">
                          <label>Chest (cm)</label>
                          <input
                            type="number"
                            value={measurements.chest}
                            onChange={(e) =>
                              setMeasurements({
                                ...measurements,
                                chest: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="body-field">
                          <label>Waist (cm)</label>
                          <input
                            type="number"
                            value={measurements.waist}
                            onChange={(e) =>
                              setMeasurements({
                                ...measurements,
                                waist: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="body-field">
                          <label>Hips (cm)</label>
                          <input
                            type="number"
                            value={measurements.hips}
                            onChange={(e) =>
                              setMeasurements({
                                ...measurements,
                                hips: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* MACROS */}
                    <div className="macro-summary">
                      <h3>Selected Meal Macros</h3>
                      <p>Calories: {totalMacros.calories} kcal</p>
                      <p>Protein: {totalMacros.protein} g</p>
                      <p>Fat: {totalMacros.fat} g</p>
                      <p>Carbs: {totalMacros.carbs} g</p>
                    </div>

                    {/* MEALS */}
                    <div className="section meals-section">
                      <h3>Meals</h3>
                      {meals.map((meal, mIdx) => (
                        <div key={mIdx} className="meal-card">
                          <h4>{meal.mealType}</h4>
                          {meal.items.map((item, iIdx) => (
                            <div key={iIdx} className="meal-item">
                              <input
                                type="radio"
                                name={`meal-${mIdx}`}
                                checked={item.selected || false}
                                onChange={() => handleMealSelection(mIdx, iIdx)}
                              />
                              <input
                                type="text"
                                value={item.name || ""}
                                onChange={(e) => {
                                  const newMeals = [...meals];
                                  newMeals[mIdx].items[iIdx].name =
                                    e.target.value;
                                  setMeals(newMeals);
                                }}
                              />
                              <input
                                type="number"
                                value={item.calories || 0}
                                onChange={(e) => {
                                  const newMeals = [...meals];
                                  newMeals[mIdx].items[iIdx].calories =
                                    Number(e.target.value);
                                  setMeals(newMeals);
                                }}
                              />
                              <span>kcal</span>
                              <input
                                type="number"
                                value={item.protein || 0}
                                onChange={(e) => {
                                  const newMeals = [...meals];
                                  newMeals[mIdx].items[iIdx].protein = Number(
                                    e.target.value
                                  );
                                  setMeals(newMeals);
                                }}
                              />
                              <span>g protein</span>
                              <input
                                type="number"
                                value={item.fat || 0}
                                onChange={(e) => {
                                  const newMeals = [...meals];
                                  newMeals[mIdx].items[iIdx].fat = Number(
                                    e.target.value
                                  );
                                  setMeals(newMeals);
                                }}
                              />
                              <span>g fat</span>
                              <input
                                type="number"
                                value={item.carbohydrates || 0}
                                onChange={(e) => {
                                  const newMeals = [...meals];
                                  newMeals[mIdx].items[iIdx].carbohydrates =
                                    Number(e.target.value);
                                  setMeals(newMeals);
                                }}
                              />
                              <span>g carbs</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* WORKOUTS */}
                    <div className="section workouts-section">
                      <h3>Workouts</h3>
                      {workouts.map((w, idx) => (
                        <div key={idx} className="workout-card">
                          <input
                            type="text"
                            value={w.name}
                            onChange={(e) =>
                              handleWorkoutChange(idx, "name", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            value={w.sets}
                            onChange={(e) =>
                              handleWorkoutChange(idx, "sets", e.target.value)
                            }
                          />
                          <input
                            type="text"
                            value={w.reps}
                            onChange={(e) =>
                              handleWorkoutChange(idx, "reps", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            value={w.caloriesBurned}
                            onChange={(e) =>
                              handleWorkoutChange(
                                idx,
                                "caloriesBurned",
                                e.target.value
                              )
                            }
                          />
                          <span>kcal</span>
                        </div>
                      ))}
                    </div>

                    <button className="submit-day" onClick={submitDay}>
                      Submit Day
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
