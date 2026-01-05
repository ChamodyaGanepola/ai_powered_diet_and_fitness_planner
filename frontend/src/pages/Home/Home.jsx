import { useEffect, useState } from "react";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import ProfileCard from "../../component/ProfileCard.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { getProfileByUserId } from "../../api/userProfileApi.js";
import "./Home.css";

const Home = () => {
  const { user, profileUpdated } = useAuth(); // listen to global profile updates
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);

  // Fetch profile reactively
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getProfileByUserId(user.id);
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
  }, [user?.id, profileUpdated]); // refetch whenever user changes or profileUpdated triggers

  return (
    <>
      <Header />

      <main className="home">
        <section className="hero">
          <h1>
            Welcome {user ? `, ${user.username}` : ""} to Your AI Diet Fitness
            Planner
          </h1>
          <p>Your personalized health and fitness assistant powered by AI</p>

          <div>
            {!loading && (
              <button
                className="primary-btn"
                onClick={() => setShowProfileCard(true)}
              >
                {profile
                  ? "Edit Your Profile for better recommendations"
                  : "Get Started - Set Up Your Profile"}
              </button>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="feature-card">
            <h3>🥗 Personalized Diet Plans</h3>
            <p>AI-generated meal plans based on your goals and preferences</p>
          </div>

          <div className="feature-card">
            <h3>💪 Custom Workouts</h3>
            <p>
              Tailored exercise routines for your fitness level and equipment
            </p>
          </div>

          <div className="feature-card">
            <h3>📊 Progress Tracking</h3>
            <p>Monitor your journey with detailed analytics and insights</p>
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

      <Footer />
    </>
  );
};

export default Home;
