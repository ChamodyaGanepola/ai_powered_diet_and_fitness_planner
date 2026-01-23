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
import { FaTrash } from "react-icons/fa";
import { useAlert } from "../../context/alertContext.jsx";
import { createNotification } from "../../api/notificationApi.js";

export default function DietPlan() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
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
      await createNotification(
        `Hi ${user.username}, you marked your current active meal plan as not suitable due to "${reason}" 😢`,
      );
      showAlert({
        type: "error",
        message: `${user.username}, you marked your current active meal plan as not suitable.`,
        autoClose: true,
        duration: 6000,
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

  if (loading) {
    return <Loading text="Loading Meal Plan..." />;
  }

  if (!profileExists) {
    return (
      <div className="app-container">
        <div className="empty-state">
          <p className="simple-message">
            Hey {user.username}, first create your profile. Redirecting to
            home...
          </p>
        </div>
      </div>
    );
  }
  else if (mealPlans.length === 0) {
  return (
    <div className="app-container">
      <div className="empty-state">
        <p className="simple-message">
          No active meal plan available. You can generate one based on your profile.
        </p>

        <button className="generate-btn" onClick={handleGenerateMealPlan}>
          Generate Meal Plan
        </button>

        {/* Meal Feedback Section */}
        <div className="feedback-section">
          <div
            className="feedback-header-toggle"
            onClick={() => setShowFeedbackList((prev) => !prev)}
          >
            <span className={`feedback-arrow ${showFeedbackList ? "open" : ""}`}>
              ▾
            </span>

            <h2 className="feedback-title">
              Your Previous Meal Plan Feedback.
            </h2>
          </div>

          {/* Collapsible content */}
          <div className={`feedback-content ${showFeedbackList ? "show" : "hide"}`}>
            <FeedbackList
              userId={user.id}
              userProfileId={userProfileId}
              type="meal"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="diet-page">
      <div className="meal-plan-wrapper">
        <div className="meal-plan-inner">
          {mealPlans.map((plan, index) => (
            <MealPlanCard
              key={index}
              plan={plan}
              index={index}
              showHeader={true} // show header on DietPlan page
            />
          ))}
        </div>
      </div>

      <div className="delete-wrapper">
        <button
          className="delete-button"
          onClick={handleDeleteMealPlan}
          disabled={loading}
        >
          <FaTrash />
          Delete Meal Plan
        </button>
      </div>
      
      {/* Meal Feedback Section */}
      <div className="feedback-section">
        <div
          className="feedback-header-toggle"
          onClick={() => setShowFeedbackList((prev) => !prev)}
        >
          <span className={`feedback-arrow ${showFeedbackList ? "open" : ""}`}>
            ▾
          </span>

          <h2 className="feedback-title">
            Your Previous Meal Plan Feedback (Not suitable)
          </h2>
        </div>

        {/* Collapsible content */}
        <div
          className={`feedback-content ${showFeedbackList ? "show" : "hide"}`}
        >
          <FeedbackList
            userId={user.id}
            userProfileId={userProfileId}
            type="meal"
          />
        </div>
      </div>
      <PlanFeedbackModal
        open={showFeedback}
        onCancel={() => setShowFeedback(false)}
        onConfirm={confirmMealFeedback}
        title="Why is this meal plan not suitable?"
      />
    </div>
  );
}
