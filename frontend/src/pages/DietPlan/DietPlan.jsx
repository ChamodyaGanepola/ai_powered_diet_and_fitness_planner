import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MealPlanCard from "../../component/MealPlanCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import {
  getLatestMealPlan,
  updateMealPlanStatus,
  createMealPlan,
} from "../../api/mealPlanApi.js";
import { getProfileByUserId } from "../../api/userProfileApi.js";
import "./DietPlan.css";
import PlanFeedbackModal from "../../component/PlanFeedbackModal.jsx";
import { submitPlanFeedback } from "../../api/planFeedbackApi.js";
import FeedbackList from "../../component/FeedbackList.jsx";
import Loading from "../../component/Loading";

export default function DietPlan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profileExists, setProfileExists] = useState(true);
  const [userProfileId, setUserProfileId] = useState(null);
  const [mealPlans, setMealPlans] = useState([]);
  const [activeMealPlanId, setActiveMealPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFeedbackList, setShowFeedbackList] = useState(false);

  useEffect(() => {
    checkUserProfile();
  }, []);

  // ✅ Check if user profile exists
  const checkUserProfile = async () => {
    try {
      const res = await getProfileByUserId();
      console.log("Profile check response:", res);

      // ✅ Correct check for your API structure
      if (!res || !res._id) {
        setUserProfileId(null);
        setProfileExists(false);
        setLoading(false);

        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/home");
        }, 3000);

        return;
      }
      setUserProfileId(res._id);

      // Profile exists → fetch meal plans
      setProfileExists(true);
      fetchMealPlans();
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfileExists(false);
      setLoading(false);
      setTimeout(() => {
        navigate("/home");
      }, 3000);
    }
  };

  const fetchMealPlans = async () => {
    setLoading(true);
    try {
      const res = await getLatestMealPlan();

      if (res.success && res.mealPlan) {
        const plan = res.mealPlan;
        setActiveMealPlanId(plan._id);

        const transformedPlan = {
          meals: (plan.meals || []).map((m) => ({
            mealType: m.mealType,
            items: (m.foods || []).map((f) => ({
              name: f.name,
              calories: f.calories,
              protein: f.protein,
              fat: f.fat,
              carbohydrates: f.carbohydrates,
            })),
          })),
          totalCalories: plan.totalCalories,
          totalProtein: plan.totalProtein,
          totalCarbs: plan.totalCarbs,
          totalFat: plan.totalFat,
        };

        setMealPlans([transformedPlan]);
      } else {
        setMealPlans([]);
        setActiveMealPlanId(null);
      }
    } catch (err) {
      console.error("Error fetching meal plans:", err);
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete meal plan

  const handleDeleteMealPlan = () => {
    if (!activeMealPlanId) return;
    setShowFeedback(true);
  };
  const confirmMealFeedback = async (reason) => {
    try {
      await updateMealPlanStatus(activeMealPlanId, "not-suitable");

      await submitPlanFeedback({
        userProfile_id: userProfileId,
        planType: "meal",
        mealPlan_id: activeMealPlanId,
        reason,
      });

      fetchMealPlans(); // refresh plans
    } catch (err) {
      console.error(err);
    }
  };

  // Generate meal plan
  const handleGenerateMealPlan = async () => {
    try {
      await createMealPlan();
      await fetchMealPlans();
    } catch (err) {
      console.error("Failed to generate meal plan:", err);
    }
  };

  return (
    <div className="diet-page">
      {loading ? (
        <Loading text="Loading meal plans..." />
      ) : !profileExists ? (
        <div className="centered-card">
          <h1 className="greeting">Hey {user.username},</h1>
          <p className="no-plan-text">
            First create your profile. Redirecting to home...
          </p>
        </div>
      ) : mealPlans.length === 0 ? (
        <div className="centered-card">
          <h1 className="greeting">Hey {user.username},</h1>
          <p className="no-plan-text">
            No active meal plan available. You can generate one based on your
            profile.
          </p>
          <button className="generate-btn" onClick={handleGenerateMealPlan}>
            Generate Meal Plan
          </button>
        </div>
      ) : (
        <>
        <div className="meal-plan-wrapper">
          {mealPlans.map((plan, index) => (
            <MealPlanCard key={index} plan={plan} index={index} />
          ))}
          </div>

          <div className="delete-wrapper">
            <button
              className="delete-button"
              onClick={handleDeleteMealPlan}
              disabled={loading}
            >
              Delete Meal Plan
            </button>
          </div>
          {/* Meal Feedback Section */}
          <div className="feedback-section">
            <div
              className="feedback-header-toggle"
              onClick={() => setShowFeedbackList((prev) => !prev)}
            >
              <span
                className={`feedback-arrow ${showFeedbackList ? "open" : ""}`}
              >
                ▾
              </span>

              <h2 className="feedback-title">
                Your Previous Meal Plan Feedback (Not suitable)
              </h2>
            </div>

            {/* Collapsible content */}
            <div
              className={`feedback-content ${
                showFeedbackList ? "show" : "hide"
              }`}
            >
              <FeedbackList
                userId={user.id}
                userProfileId={userProfileId}
                type="meal"
              />
            </div>
          </div>
        </>
      )}
      <PlanFeedbackModal
        open={showFeedback}
        onCancel={() => setShowFeedback(false)}
        onConfirm={confirmMealFeedback}
        title="Why is this meal plan not suitable?"
      />
    </div>
  );
}
