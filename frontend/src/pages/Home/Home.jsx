import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../../component/ProfileCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { getProfileByUserId } from "../../api/userProfileApi.js";
import "./Home.css";
import workoutImage from "../../images/workout-image.jpg";
import mealPlanImage from "../../images/meal-plan.jpg";
import progressImage from "../../images/progress.jpg";
import PageHeader from "../../component/PageHeader.jsx";
import { FaHome } from "react-icons/fa";
import { FaEdit, FaUserPlus } from "react-icons/fa";
import Alert from "../../component/Alert.jsx";
import { useLocation } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alert, setAlert] = useState(location.state?.alert || null);
  const { user, profileUpdated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    if (location.state?.alert) {
      setAlert(location.state.alert);
      // clear it so it doesn't show again on refresh
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getProfileByUserId();
        console.log("Fetched profile data in Home:", data);
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile in Home:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, profileUpdated, token]);

  return (
    <main className="home">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          autoClose={alert.autoClose}
          duration={alert.duration}
          onClose={() => setAlert(null)}
        />
      )}
      <section className="hero">
        <div className="hero-row">
          <PageHeader
            icon={<FaHome />}
            title={`Welcome${user ? `, ${user.username}` : ""} to Your AI Diet Fitness Planner`}
            subtitle="Your personalized health and fitness assistant powered by AI"
          />

          {!loading && (
            <button
              className="primary-btn hero-btn"
              onClick={() => setShowProfileCard(true)}
            >
              {profile ? (
                <>
                  <FaEdit />
                  Edit Your Profile Here
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Get Started Here
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div
          className="feature-card diet-card"
          onClick={() => navigate("/dietplan")}
        >
          <div className="feature-text">
            <h3>🥗 Personalized Diet Plans</h3>
            <p>AI-generated meal plans based on your goals and preferences</p>
          </div>

          <div className="feature-image-wrap">
            <img src={mealPlanImage} alt="Diet Plan" />
          </div>
        </div>

        <div className="feature-card workout-cards">
          <div className="feature-text">
            <h3>💪 Custom Workouts</h3>
            <p>
              Tailored exercise routines for your fitness level and equipment
            </p>
          </div>

          <div className="feature-image-wrap">
            <img src={workoutImage} alt="Workout Plan" />
          </div>
        </div>

        <div
          className="feature-card progress-cards"
          onClick={() => navigate("/dailyprogress")}
        >
          <div className="feature-text">
            <h3>📊 Progress Tracking</h3>
            <p>Monitor your journey with detailed <br/> analytics and insights</p>
          </div>

          <div className="feature-image-wrap">
            <img src={progressImage} alt="Progress" />
          </div>
        </div>
      </section>

      {/* Profile Modal */}
      {showProfileCard && (
        <ProfileCard
          onClose={() => setShowProfileCard(false)}
          edit={!!profile}
        />
      )}
    </main>
  );
};

export default Home;
