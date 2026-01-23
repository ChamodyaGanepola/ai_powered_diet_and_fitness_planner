import { useEffect, useState, useRef } from "react";
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
import { useAlert } from "../../context/alertContext.jsx";
import { createNotification } from "../../api/notificationApi.js";
import SavedDailyProgress from "../../component/SavedDailyProgress.jsx";
import {
  onlyPositiveNumbers,
  onlyLettersAllowEmpty,
} from "../../utils/validation.js";

import {
  FaChartLine,
  FaDumbbell,
  FaWeight,
  FaAppleAlt,
  FaCalendarPlus,
  FaLeaf,
  FaInfoCircle,
} from "react-icons/fa";
import { getProfileByUserId } from "../../api/userProfileApi.js";
import PageHeader from "../../component/PageHeader.jsx";
import Loading from "../../component/Loading.jsx";
import ConfirmModal from "../../component/ConfirmModal.jsx";

export default function DailyProgress() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [profileExists, setProfileExists] = useState(true);
  const [mealPlanExists, setMealPlanExists] = useState(false);
  const [workoutPlanExists, setWorkoutPlanExists] = useState(false);

  const [mealCompletedDates, setMealCompletedDates] = useState([]);
  const [workoutCompletedDates, setWorkoutCompletedDates] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  const [locked, setLocked] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const [confirmedSkips, setConfirmedSkips] = useState({
    meals: {},
    workouts: false,
  });

  // <--- IMPORTANT
  const confirmedSkipsRef = useRef({
    meals: {},
    workouts: false,
  });

  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

      const mealExists = !!mealRes?.mealPlan;
      const workoutExists = !!workoutRes?.workoutPlan;

      setMealPlanExists(mealExists);
      setWorkoutPlanExists(workoutExists);
      setPlansChecked(true);

      if (!mealExists && !workoutExists) {
        setTimeout(() => (window.location.href = "/home"), 3000);
      }

      if (mealExists) {
        const start = new Date(mealRes.mealPlan.startDate);
        const end = new Date(mealRes.mealPlan.endDate);
        const durationDays =
          Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
        setMealPlanDurationDays(durationDays);
      }
      if (workoutExists) {
        const start = new Date(workoutDetails.workoutPlan.startDate);
        const end = new Date(workoutDetails.workoutPlan.endDate);
        const durationDays =
          Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
        setWorkoutPlanDurationDays(durationDays);
      }
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
        selected: false,
      }));

      setWorkouts(workoutData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const today = formatDateUTC(new Date());

    let minDate = "";
    if (planMealStartDate && planWorkoutStartDate) {
      minDate =
        planMealStartDate < planWorkoutStartDate
          ? planMealStartDate
          : planWorkoutStartDate;
    } else {
      minDate = planMealStartDate || planWorkoutStartDate || "";
    }

    let maxDate = "";
    if (planMealEndDate && planWorkoutEndDate) {
      maxDate =
        planMealEndDate > planWorkoutEndDate
          ? planMealEndDate
          : planWorkoutEndDate;
    } else {
      maxDate = planMealEndDate || planWorkoutEndDate || "";
    }

    if (maxDate && maxDate > today) {
      maxDate = today;
    }

    setGlobalMinDate(minDate);
    setGlobalMaxDate(maxDate);
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

  const handleWorkoutSelection = (idx) => {
    const newWorkouts = workouts.map((w, i) => ({
      ...w,
      selected: i === idx,
    }));
    setWorkouts(newWorkouts);
  };

  const handleWorkoutChange = (idx, key, value) => {
    const newWorkouts = [...workouts];
    if (["sets", "reps", "caloriesBurned", "duration"].includes(key))
      value = Number(value);

    newWorkouts[idx][key] = value;
    setWorkouts(newWorkouts);
  };

  const isInvalidNumber = (v) => !v || Number(v) <= 0;
  const isPositiveNumber = (v) => v && Number(v) > 0;
  const isEmpty = (v) => {
    if (v === null || v === undefined) return true;

    if (typeof v === "string" || v instanceof String) {
      return v.toString().trim() === "";
    }

    if (typeof v === "number") return v <= 0;

    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "object") return Object.keys(v).length === 0;

    return false;
  };

  const getPayloadMeals = () => {
    return meals.map((meal) => {
      const selectedItem = meal.items.find((i) => i.selected);

      if (selectedItem) {
        return {
          mealType: meal.mealType,
          items: [selectedItem],
        };
      }

      if (confirmedSkipsRef.current.meals[meal.mealType]) {
        return {
          mealType: meal.mealType,
          items: [],
        };
      }

      return {
        mealType: meal.mealType,
        items: [],
      };
    });
  };

  const getPayloadWorkouts = () => {
    const selectedWorkout = workouts.find((w) => w.selected);

    if (selectedWorkout) {
      return [selectedWorkout];
    }

    if (confirmedSkipsRef.current.workouts) {
      return [];
    }

    return [];
  };

  const actuallySubmit = async () => {
    try {
      const payloadMeals = getPayloadMeals();
      const payloadWorkouts = getPayloadWorkouts();

      await createDailyProgress(
        selectedDateStr,
        weight,
        bodyFatPercentage,
        measurements,
        payloadMeals,
        payloadWorkouts,
      );

      setLocked(true);
      setSuccessMessage(
        `✔ Progress saved successfully for ${selectedDateStr}!`,
      );
      showAlert({
          type: "success",
          message: `✔ Progress saved successfully for ${selectedDateStr}!`,
          autoClose: true,
          duration: 3000,
        });
      try {
        await createNotification(
          `Hi ${user.username}! 🌟 Progress saved for ${selectedDateStr}. Keep going!!`,
        );
      } catch (e) {
        console.warn("Notification failed", e);
      }
    } catch (err) {
      console.error(err);

      showAlert({
        type: "error",
        message: "Failed to save progress. ",
        autoClose: true,
        duration: 3000,
      });
    }
  };

  const submitDay = async () => {
    // Body metrics validation
    if (
      isEmpty(weight) ||
      isEmpty(bodyFatPercentage) ||
      isEmpty(measurements.chest) ||
      isEmpty(measurements.waist) ||
      isEmpty(measurements.hips)
    ) {
      showAlert({
        type: "error",
        message:
          "Please fill all body metrics (weight, body fat, chest, waist, hips).",
        autoClose: true,
        duration: 3000,
      });

      return;
    }

    // Meals validation + skip confirm
    for (const meal of meals) {
      const selectedItem = meal.items.find((i) => i.selected);

      if (!selectedItem && !confirmedSkipsRef.current.meals[meal.mealType]) {
        setConfirmData({
          message: `Are you sure you didn’t complete ${meal.mealType}?`,
          onConfirm: async () => {
            setConfirmedSkips((prev) => {
              const updated = {
                ...prev,
                meals: { ...prev.meals, [meal.mealType]: true },
              };
              confirmedSkipsRef.current = updated;
              return updated;
            });
            await submitDay();
          },
        });
        return;
      }

      if (selectedItem) {
        if (isEmpty(selectedItem.name)) {
          showAlert({
            type: "error",
            message: `${meal.mealType}: Meal name is required.`,
            autoClose: true,
            duration: 3000,
          });
          return;
        }
        if (
          !isPositiveNumber(selectedItem.calories) ||
          !isPositiveNumber(selectedItem.protein) ||
          !isPositiveNumber(selectedItem.fat) ||
          !isPositiveNumber(selectedItem.carbohydrates)
        ) {
          
          showAlert({
            type: "error",
            message: `${meal.mealType}: All macros must be filled and > 0.`,
            autoClose: true,
            duration: 3000,
          });
          return;
        }
      }
    }

    // Workout validation + skip confirm
    const selectedWorkout = workouts.find((w) => w.selected);

    if (!selectedWorkout && !confirmedSkipsRef.current.workouts) {
      setConfirmData({
        message: "Are you sure you didn’t complete any workouts today?",
        onConfirm: async () => {
          setConfirmedSkips((prev) => {
            const updated = { ...prev, workouts: true };
            confirmedSkipsRef.current = updated;
            return updated;
          });

          await submitDay();
        },
      });
      return;
    }

    if (selectedWorkout) {
      if (isEmpty(selectedWorkout.name)) {
          showAlert({
            type: "error",
            message: "Workout name is required.",
            autoClose: true,
            duration: 3000,
          });
        return;
      }
      if (!isPositiveNumber(selectedWorkout.caloriesBurned)) {
        showAlert({
            type: "error",
            message: "Workout calories must be filled and > 0.",
            autoClose: true,
            duration: 3000,
          });
        return;
      }
    }

    // Final submit confirm
    setConfirmData({
      message: "Are you sure you want to submit? You can't edit again!",
      onConfirm: async () => {
        await actuallySubmit();
      },
    });
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

  return (
    <div className="progress-page">
      <div className="progress-inner">
        <PageHeader
          icon={<FaChartLine />}
          title="Daily Progress Tracker"
          subtitle="Track your progress daily — stay consistent."
        />

        {confirmData && (
          <ConfirmModal
            open={true}
            title="Please Confirm"
            message={confirmData.message}
            onCancel={() => setConfirmData(null)}
            onConfirm={async () => {
              const fn = confirmData?.onConfirm;
              if (fn) await fn(); // run the function FIRST
              setConfirmData(null); // close modal AFTER
            }}
          />
        )}
        <div className="date-container">
          <p>Select a date that falls between the start and end dates.</p>
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="date-picker"
            min={globalMinDate}
            max={globalMaxDate}
            disabled={!globalMinDate || !globalMaxDate}
          />
        </div>

        {((mealPlanExists && !planMealStartDate) ||
          (workoutPlanExists && !planWorkoutStartDate)) && (
          <button
            className="submit-day"
            style={{ marginTop: "15px" }}
            onClick={() => setShowStartDateModal(true)}
          >
            <FaCalendarPlus className="icon-white" />{" "}
            <span>Set Start Dates</span>
          </button>
        )}

        {/* Start Date Modal */}
        {/* Start Date Modal */}
        {showStartDateModal &&
          ((mealPlanExists && !planMealStartDate) ||
            (workoutPlanExists && !planWorkoutStartDate)) && (
            <div className="modal-overlay">
              <div className="startdate-card">
                <div className="startdate-header">
                  <h2>Set Plan Start Dates</h2>
                  <p>
                    Choose the start date. End date will be calculated
                    automatically according to your user profile.
                  </p>
                </div>

                {mealPlanExists && !planMealStartDate && (
                  <div className="startdate-section">
                    <h3>Meal Plan Start Date</h3>
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
                      <div className="end-date">
                        Calculated End Date: <strong>{mealEndDate}</strong>
                      </div>
                    )}
                  </div>
                )}

                {workoutPlanExists && !planWorkoutStartDate && (
                  <div className="startdate-section">
                    <h3>Workout Plan Start Date</h3>
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
                      <div className="end-date">
                        Calculated End Date: <strong>{workoutEndDate}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-buttons">
                  <button
                    className="btn-confirm"
                    onClick={() => setConfirmOpen(true)}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn-cancel"
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

        {/* Start Date Confirm */}
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
                <FaInfoCircle className="icon-green" />
                No progress available for this date.
              </p>
            ) : (
              <>
                {locked ? (
                  <>
    <p className="done">{successMessage}</p>

    <SavedDailyProgress
      date={selectedDateStr}
    />
  </>
                ) : (
                  <>
                    {/* Body Metrics */}
                    <div className="section body-section">
                      <h3>
                        {" "}
                        <FaWeight className="icon-green" />{" "}
                        <span>
                          Please enter your body measurements for the selected
                          date.
                        </span>
                      </h3>
                      <div className="body-grid">
                        <div className="body-field">
                          <label>Weight (kg)</label>
                          <input
                            type="text"
                            value={weight}
                            onChange={(e) =>
                              setWeight(onlyPositiveNumbers(e.target.value))
                            }
                          />
                        </div>
                        <div className="body-field">
                          <label>Body Fat (%)</label>
                          <input
                            type="text"
                            value={bodyFatPercentage}
                            onChange={(e) =>
                              setBodyFatPercentage(
                                onlyPositiveNumbers(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="body-field">
                          <label>Chest (cm)</label>
                          <input
                            type="text"
                            value={measurements.chest}
                            onChange={(e) =>
                              setMeasurements({
                                ...measurements,
                                chest: onlyPositiveNumbers(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="body-field">
                          <label>Waist (cm)</label>
                          <input
                            type="text"
                            value={measurements.waist}
                            onChange={(e) =>
                              setMeasurements({
                                ...measurements,
                                waist: onlyPositiveNumbers(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="body-field">
                          <label>Hips (cm)</label>
                          <input
                            type="text"
                            value={measurements.hips}
                            onChange={(e) =>
                              setMeasurements({
                                ...measurements,
                                hips: onlyPositiveNumbers(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meals */}
                    {!isLockedMeal && (
                      <>
                        <div className="macro-summary">
                          <h3>
                            <FaLeaf className="icon-green" />{" "}
                            <span>Your Total Intake for {selectedDateStr}</span>
                          </h3>
                          <div className="food-right">
                            <div className="food-metric kcal">
                              <div className="value">
                                {totalMacros.calories}
                              </div>
                              <div className="label">kcal</div>
                            </div>
                            <div className="food-metric protein">
                              <div className="value">{totalMacros.protein}</div>
                              <div className="label">Protein</div>
                            </div>
                            <div className="food-metric fat">
                              <div className="value">{totalMacros.fat}</div>
                              <div className="label">Fat</div>
                            </div>
                            <div className="food-metric carbs">
                              <div className="value">{totalMacros.carbs}</div>
                              <div className="label">Carbs</div>
                            </div>
                          </div>
                        </div>
                        <div className="section meals-section">
                          <h3>
                            {" "}
                            <FaAppleAlt className="icon-green" />{" "}
                            <span>
                              Select/Edit Meals to Record Your Daily Real
                              Progress
                            </span>
                          </h3>
                          {meals.map((meal, mIdx) => (
                            <div
                              key={mIdx}
                              className={`meal-card ${meal.mealType.toLowerCase()}`}
                            >
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
                                        onlyLettersAllowEmpty(e.target.value);
                                      setMeals(newMeals);
                                    }}
                                  />

                                  <input
                                    type="text"
                                    value={item.calories || ""}
                                    onChange={(e) => {
                                      const newMeals = [...meals];
                                      newMeals[mIdx].items[iIdx].calories =
                                        onlyPositiveNumbers(e.target.value);
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
                                        onlyPositiveNumbers(e.target.value);
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
                                        onlyPositiveNumbers(e.target.value);
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
                                        onlyPositiveNumbers(e.target.value);
                                      setMeals(newMeals);
                                    }}
                                  />
                                  <span>g carbs</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Workouts */}
                    {!isLockedWorkout && (
                      <div className="section workouts-section">
                        <h3>
                          <FaDumbbell className="icon-green" />
                          <span>
                            {" "}
                            Select/Edit Workout to Record Your Daily Real
                            Progress
                          </span>
                        </h3>
                        {workouts.map((w, idx) => (
                          <div key={idx} className="workout-card">
                            <div className="workout-item">
                              <input
                                type="radio"
                                name="workout"
                                checked={w.selected || false}
                                onChange={() => handleWorkoutSelection(idx)}
                              />

                              <input
                                type="text"
                                value={w.name || ""}
                                onChange={(e) =>
                                  handleWorkoutChange(
                                    idx,
                                    "name",
                                    onlyLettersAllowEmpty(e.target.value),
                                  )
                                }
                                placeholder="Workout Name"
                              />

                              <input
                                type="text"
                                value={w.sets || ""}
                                onChange={(e) =>
                                  handleWorkoutChange(
                                    idx,
                                    "sets",
                                    onlyPositiveNumbers(e.target.value),
                                  )
                                }
                                placeholder="Sets"
                              />
                              <span>sets</span>
                              <input
                                type="text"
                                value={w.reps || ""}
                                onChange={(e) =>
                                  handleWorkoutChange(
                                    idx,
                                    "reps",
                                    onlyPositiveNumbers(e.target.value),
                                  )
                                }
                                placeholder="Reps"
                              />
                              <span>reps</span>
                              <input
                                type="text"
                                value={w.caloriesBurned || ""}
                                onChange={(e) =>
                                  handleWorkoutChange(
                                    idx,
                                    "caloriesBurned",
                                    onlyPositiveNumbers(e.target.value),
                                  )
                                }
                                placeholder="kcal"
                              />
                              <span>kcal</span>
                            </div>
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
