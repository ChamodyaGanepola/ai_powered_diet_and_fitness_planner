import { useEffect, useState } from "react";
import "./DailyProgress.css";
import { useAuth } from "../../context/authContext.jsx";
import {
  getLatestWorkoutPlan,
  getExercisesByDate,
  getWorkoutPlanDetails,
} from "../../api/workoutPlan.js";
import { getLatestMealPlan } from "../../api/mealPlanApi.js";
import {
  getDailyProgressByDate,
  createDailyProgress,
  resetPlanDatesIfNoProgress,
  checkDailyProgressForUser,
  getCompletedProgressDates,
  updateDailyProgress,
} from "../../api/dailyProgress.js";

import { FaChartLine } from "react-icons/fa";
import { getProfileByUserId } from "../../api/userProfileApi.js";
import PageHeader from "../../component/PageHeader.jsx";
import Loading from "../../component/Loading.jsx";
import ConfirmModal from "../../component/ConfirmModal.jsx";

export default function DailyProgress() {
  const { user } = useAuth();

  const [profileExists, setProfileExists] = useState(true);
  const [mealPlanExists, setMealPlanExists] = useState(false);
  const [workoutPlanExists, setWorkoutPlanExists] = useState(false);

  const [mealCompletedDates, setMealCompletedDates] = useState([]);
  const [workoutCompletedDates, setWorkoutCompletedDates] = useState([]);

  // ✅ ONLY DATE STATE
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  const [locked, setLocked] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ONE modal
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Dates
  const [mealModalDate, setMealModalDate] = useState("");
  const [workoutModalDate, setWorkoutModalDate] = useState("");

  const [mealEndDate, setMealEndDate] = useState("");
  const [workoutEndDate, setWorkoutEndDate] = useState("");
  const [globalMinDate, setGlobalMinDate] = useState("");
  const [globalMaxDate, setGlobalMaxDate] = useState("");

  const [planMealStartDate, setPlanMealStartDate] = useState(null);
  const [planMealEndDate, setPlanMealEndDate] = useState(null);

  const [planWorkoutStartDate, setPlanWorkoutStartDate] = useState(null);
  const [planWorkoutEndDate, setPlanWorkoutEndDate] = useState(null);

  const [mealPlanDurationDays, setMealPlanDurationDays] = useState(0);
  const [workoutPlanDurationDays, setWorkoutPlanDurationDays] = useState(0);

  // NEW
  const [isLockedMeal, setIsLockedMeal] = useState(false);
  const [isLockedWorkout, setIsLockedWorkout] = useState(false);

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

  const selectedDateStr = formatDateUTC(selectedDate);

  const isMealDateValid = (date) => {
    if (!planMealStartDate || !planMealEndDate) return false;
    const today = formatDateUTC(new Date());
    return (
      date >= planMealStartDate && date <= planMealEndDate && date <= today
    );
  };

  const isWorkoutDateValid = (date) => {
    if (!planWorkoutStartDate || !planWorkoutEndDate) return false;
    const today = formatDateUTC(new Date());
    return (
      date >= planWorkoutStartDate &&
      date <= planWorkoutEndDate &&
      date <= today
    );
  };

  const isDateWithinPlan = (date) => {
    return isMealDateValid(date) || isWorkoutDateValid(date);
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
      const workoutDetails = await getWorkoutPlanDetails();
      //console.log("meal plan start date", mealRes.mealPlan.startDate);
      //console.log("workout plan start date",workoutDetails.workoutPlan.startDate );
      //console.log("meal plan end date", mealRes.mealPlan.endDate);
      //console.log("workout plan end date", workoutDetails.workoutPlan.endDate);
      const mealExists = !!mealRes?.mealPlan;
      const workoutExists = !!workoutRes?.workoutPlan;
      //console.log("meal exists",!!mealRes?.mealPlan);
      // console.log("workout exists",!!workoutRes?.workoutPlan);
      setMealPlanExists(mealExists);
      setWorkoutPlanExists(workoutExists);
      setPlansChecked(true);

      if (!mealExists && !workoutExists) {
        setTimeout(() => (window.location.href = "/home"), 3000);
      }

      if (mealExists) {
        const start = new Date(mealRes.mealPlan.startDate);
        const end = new Date(mealRes.mealPlan.endDate);
        console.log("start", start);
        const durationDays =
          Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
        setMealPlanDurationDays(durationDays);
        console.log("Active meal plan durations", durationDays);
      }
      if (workoutExists) {
        const start = new Date(workoutDetails.workoutPlan.startDate);
        const end = new Date(workoutDetails.workoutPlan.endDate);
        const durationDays =
          Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
        setWorkoutPlanDurationDays(durationDays);
        console.log("Active workout plan durations", durationDays);
      }

      /*const progressRes = await checkDailyProgressForUser();
      console.log("progress meal", progressRes);
      if (
        (mealExists && !progressRes.mealPlan.progressExists) ||
        (workoutExists && !progressRes.workoutPlan.progressExists)
      ) {
        
        setShowStartDateModal(true);
        console.log("1 start show true ", showStartDateModal);
        console.log("progressRes.mealPlan.progressExists", progressRes.mealPlan.progressExists);
      }
      if (mealExists && progressRes.mealPlan.progressExists) {
       console.log("mealExists && progressRes.mealPlan.progressExists", mealExists && progressRes.mealPlan.progressExists);
        setPlanMealStartDate(formatDateUTC(mealRes.mealPlan.startDate));
        setPlanMealEndDate(formatDateUTC(mealRes.mealPlan.endDate));
        console.log("Progress meal exist", progressRes.mealPlan.progressExists);
      }
      if (workoutExists && progressRes.workoutPlan.progressExists) {
        setPlanWorkoutStartDate(
          formatDateUTC(workoutRes.workoutPlan.startDate),
        );
        setPlanWorkoutEndDate(formatDateUTC(workoutRes.workoutPlan.endDate));
        console.log(
          "Progress workout exist",
          progressRes.workoutPlan.progressExists,
        );
      }*/
    } catch (err) {
      console.error(err);
    } finally {
      initDailyProgress();
    }
  };

  useEffect(() => {
    loadDailyProgressForDate(selectedDate);
  }, [selectedDate]);

  const loadDailyProgressForDate = async (dateObj) => {
    setLoading(true);
    const formattedDate = formatDateUTC(dateObj);

    try {
      const progressRes = await getDailyProgressByDate(formattedDate);
      console.log("progressRes", progressRes);
      if (progressRes.progress) {
        loadProgress(progressRes.progress);
        setLocked(true);
        setSuccessMessage(`✔ Progress already completed for ${formattedDate}`);
      } else {
        setLocked(false);
        setIsLockedMeal(false);
        setIsLockedWorkout(false);
        setSuccessMessage("");
        await fetchPlans(formattedDate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (showStartDateModal) {
      const today = selectedDateStr;

      if (mealPlanExists && !planMealStartDate && !mealModalDate) {
        setMealModalDate(today);

        const start = new Date(today);
        const end = new Date(start);
        end.setDate(end.getDate() + mealPlanDurationDays - 1);
        setMealEndDate(formatDateUTC(end));
      }

      if (workoutPlanExists && !planWorkoutStartDate && !workoutModalDate) {
        setWorkoutModalDate(today);

        const start = new Date(today);
        const end = new Date(start);
        end.setDate(end.getDate() + workoutPlanDurationDays - 1);
        setWorkoutEndDate(formatDateUTC(end));
      }
    }
  }, [showStartDateModal]);

  const loadProgress = (progress) => {
    setMeals(progress.meals || []);
    setWorkouts(progress.workouts || []);
    console.log("meals", progress.meals);

    // NEW
    setIsLockedMeal(progress.mealAdherenceScore != null);
    setIsLockedWorkout(progress.workoutAdherenceScore != null);

    setLocked(progress.completed || false);
    setWeight(progress.weight || "");
    setBodyFatPercentage(progress.bodyFatPercentage || "");
    setMeasurements(
      progress.measurements || { chest: "", waist: "", hips: "" },
    );
  };

  const initDailyProgress = async () => {
    setLoading(true);
    try {
      const res = await checkDailyProgressForUser();
      console.log("checkDailyProgressForUser", res);
      if (res.mealPlan.progressExists === true) {
        setPlanMealStartDate(formatDateUTC(res.mealPlan.startDate));
        setPlanMealEndDate(formatDateUTC(res.mealPlan.endDate));
      }

      if (res.workoutPlan.progressExists === true) {
        setPlanWorkoutStartDate(formatDateUTC(res.workoutPlan.startDate));
        setPlanWorkoutEndDate(formatDateUTC(res.workoutPlan.endDate));
      }

      const completedRes = await getCompletedProgressDates();

      if (completedRes.success) {
        setMealCompletedDates(completedRes.mealCompletedDates || []);
        setWorkoutCompletedDates(completedRes.workoutCompletedDates || []);
      }
      await fetchPlans(selectedDateStr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async (selectedDate = selectedDateStr) => {
    console.log("selectedDate", selectedDate);
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
      console.log("meal data 1", mealData);
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
  useEffect(() => {
    const today = formatDateUTC(new Date());

    // -------- GLOBAL MIN (earliest start) --------
    let minDate = "";

    if (planMealStartDate && planWorkoutStartDate) {
      minDate =
        planMealStartDate < planWorkoutStartDate
          ? planMealStartDate
          : planWorkoutStartDate;
    } else {
      minDate = planMealStartDate || planWorkoutStartDate || "";
    }

    // -------- GLOBAL MAX (latest end) --------
    let maxDate = "";

    if (planMealEndDate && planWorkoutEndDate) {
      maxDate =
        planMealEndDate > planWorkoutEndDate
          ? planMealEndDate
          : planWorkoutEndDate;
    } else {
      maxDate = planMealEndDate || planWorkoutEndDate || "";
    }

    // -------- CAP TO TODAY --------
    if (maxDate && maxDate > today) {
      maxDate = today;
    }

    setGlobalMinDate(minDate);
    setGlobalMaxDate(maxDate);
    console.log("mindate", minDate);
    console.log("maxDate", maxDate);
  }, [
    planMealStartDate,
    planMealEndDate,
    planWorkoutStartDate,
    planWorkoutEndDate,
  ]);

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

    if (
      !window.confirm("Are you sure you want to submit? You can't edit again!")
    )
      return;

    try {
      await createDailyProgress(
        selectedDateStr,
        weight,
        bodyFatPercentage,
        measurements,
        meals,
        workouts,
      );

      if (isMealDateValid(selectedDateStr)) setIsLockedMeal(true);
      if (isWorkoutDateValid(selectedDateStr)) setIsLockedWorkout(true);

      setLocked(true);
      setSuccessMessage(
        `✔ Progress saved successfully for ${selectedDateStr}!`,
      );
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
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

  const dateValid = isDateWithinPlan(selectedDateStr);

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

  const onlyNumbers = (value) => value.replace(/[^0-9]/g, "");
  const onlyLetters = (value) => value.replace(/[^a-zA-Z\s]/g, "");

  return (
    <div className="progress-page">
      <div className="progress-inner">
        <PageHeader
          icon={<FaChartLine />}
          title="Daily Progress Tracker"
          subtitle="Track your progress daily — stay consistent."
        />

        <input
          type="date"
          value={selectedDateStr}
          onChange={(e) => {
            setSelectedDate(new Date(e.target.value));
          }}
          className="date-picker"
          min={globalMinDate}
          max={globalMaxDate}
          disabled={!globalMinDate || !globalMaxDate}
        />

        {/* SHOW BUTTON ONLY IF ANY START DATE IS MISSING */}
        {((mealPlanExists && !planMealStartDate) ||
          (workoutPlanExists && !planWorkoutStartDate)) && (
          <button
            className="submit-day"
            style={{ marginTop: "15px" }}
            onClick={() => setShowStartDateModal(true)}
          >
            Set Start Dates
          </button>
        )}

        {/* MODAL */}

        {showStartDateModal &&
          ((mealPlanExists && !planMealStartDate) ||
            (workoutPlanExists && !planWorkoutStartDate)) && (
            <div className="modal-overlay">
              <div className="modal-content">
                {/* MEAL */}
                {mealPlanExists && !planMealStartDate && (
                  <>
                    <h3>Select Meal Plan Start Date</h3>
                    <input
                      type="date"
                      value={mealModalDate || selectedDateStr}
                      onChange={(e) => {
                        setMealModalDate(e.target.value);
                        const start = new Date(e.target.value);
                        const end = new Date(start);
                        end.setDate(end.getDate() + mealPlanDurationDays - 1);
                        setMealEndDate(formatDateUTC(end));
                      }}
                    />
                    {mealEndDate && (
                      <div>
                        Calculated End Date: <strong>{mealEndDate}</strong>
                      </div>
                    )}
                  </>
                )}

                {/* WORKOUT */}
                {workoutPlanExists && !planWorkoutStartDate && (
                  <>
                    <h3>Select Workout Plan Start Date</h3>
                    <input
                      type="date"
                      value={workoutModalDate || selectedDateStr}
                      onChange={(e) => {
                        setWorkoutModalDate(e.target.value);
                        const start = new Date(e.target.value);
                        const end = new Date(start);
                        end.setDate(
                          end.getDate() + workoutPlanDurationDays - 1,
                        );
                        setWorkoutEndDate(formatDateUTC(end));
                      }}
                    />
                    {workoutEndDate && (
                      <div>
                        Calculated End Date: <strong>{workoutEndDate}</strong>
                      </div>
                    )}
                  </>
                )}

                <div className="modal-buttons">
                  <button onClick={() => setConfirmOpen(true)}>Confirm</button>
                  <button
                    onClick={() => {
                      setShowStartDateModal(false);
                      setConfirmOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* CONFIRM MODAL */}
        {showStartDateModal && (
          <ConfirmModal
            open={confirmOpen}
            title="Confirm Start Date"
            message={
              <>
                {mealPlanExists && !planMealStartDate && (
                  <>
                    Do you want to set{" "}
                    <strong>{mealModalDate || selectedDateStr}</strong> as Meal
                    Plan Start Date?
                    <br />
                  </>
                )}
                {workoutPlanExists && !planWorkoutStartDate && (
                  <>
                    Do you want to set{" "}
                    <strong>{workoutModalDate || selectedDateStr}</strong> as
                    Workout Plan Start Date?
                  </>
                )}
              </>
            }
            onCancel={() => setConfirmOpen(false)}
            onConfirm={async () => {
              const res = await resetPlanDatesIfNoProgress({
                selectedMealStartDate: mealModalDate || undefined,
                selectedWorkoutStartDate: workoutModalDate || undefined,
              });

              // UPDATE STATE AFTER SUCCESS
              if (res.updatedPlans?.mealPlan) {
                setPlanMealStartDate(
                  formatDateUTC(res.updatedPlans.mealPlan.startDate),
                );
                setPlanMealEndDate(
                  formatDateUTC(res.updatedPlans.mealPlan.endDate),
                );
              }

              if (res.updatedPlans?.workoutPlan) {
                setPlanWorkoutStartDate(
                  formatDateUTC(res.updatedPlans.workoutPlan.startDate),
                );
                setPlanWorkoutEndDate(
                  formatDateUTC(res.updatedPlans.workoutPlan.endDate),
                );
              }

              setConfirmOpen(false);
              setShowStartDateModal(false);
            }}
          />
        )}

        {!loading && (
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
                      <h3>FPlease fill these Body Metrics for the Selected Date</h3>
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
                    {!isLockedMeal && (
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
                                  onChange={() =>
                                    handleMealSelection(mIdx, iIdx)
                                  }
                                />
                                <input
                                  type="text"
                                  value={item.name || ""}
                                  onChange={(e) => {
                                    const newMeals = [...meals];
                                    newMeals[mIdx].items[iIdx].name =
                                      onlyLetters(e.target.value);
                                    setMeals(newMeals);
                                  }}
                                />
                                <input
                                  type="text"
                                  value={item.calories || ""}
                                  onChange={(e) => {
                                    const newMeals = [...meals];
                                    newMeals[mIdx].items[iIdx].calories =
                                      onlyNumbers(e.target.value);
                                    setMeals(newMeals);
                                  }}
                                />
                                <span>kcal</span>
                                <input
                                  type="text"
                                  value={item.protein || ""}
                                  onChange={(e) => {
                                    const newMeals = [...meals];
                                    newMeals[mIdx].items[iIdx].protein =
                                      onlyNumbers(e.target.value);
                                    setMeals(newMeals);
                                  }}
                                />
                                <span>g protein</span>
                                <input
                                  type="text"
                                  value={item.fat || ""}
                                  onChange={(e) => {
                                    const newMeals = [...meals];
                                    newMeals[mIdx].items[iIdx].fat =
                                      onlyNumbers(e.target.value);
                                    setMeals(newMeals);
                                  }}
                                />
                                <span>g fat</span>
                                <input
                                  type="text"
                                  value={item.carbohydrates || ""}
                                  onChange={(e) => {
                                    const newMeals = [...meals];
                                    newMeals[mIdx].items[iIdx].carbohydrates =
                                      onlyNumbers(e.target.value);
                                    setMeals(newMeals);
                                  }}
                                />
                                <span>g carbs</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* WORKOUTS */}
                    {!isLockedWorkout && (
                      <div className="section workouts-section">
                        <h3>Workouts</h3>
                        {workouts.map((w, idx) => (
                          <div key={idx} className="workout-card">
                            <input
                              type="text"
                              value={w.name}
                              onChange={(e) =>
                                handleWorkoutChange(
                                  idx,
                                  "name",
                                  onlyLetters(e.target.value),
                                )
                              }
                            />
                            <input
                              type="text"
                              value={w.sets}
                              onChange={(e) =>
                                handleWorkoutChange(
                                  idx,
                                  "sets",
                                  onlyNumbers(e.target.value),
                                )
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
                              type="text"
                              value={w.caloriesBurned}
                              onChange={(e) =>
                                handleWorkoutChange(
                                  idx,
                                  "caloriesBurned",
                                  onlyNumbers(e.target.value),
                                )
                              }
                            />
                            <span>kcal</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button className="submit-day" onClick={submitDay}>
                      <FaChartLine /> Submit Day
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
