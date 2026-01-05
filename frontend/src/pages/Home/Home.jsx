import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import "./Home.css";
import { useAuth } from "../../context/authContext.jsx";
import { useEffect, useState } from "react";
import { getProfileByUserId } from "./../../api/userProfileApi.js";
import ProfileCard from "../../component/ProfileCard.jsx";
const Home = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          console.log("id", user.id);
          console.log("data", user);
          const data = await getProfileByUserId(user.id);

          setProfile(data);
        } catch (err) {
          setProfile(null); // profile doesn't exist
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  });

  if (loading) return <p>Loading...</p>;

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
            {profile ? (
              <button className="primary-btn">
                {" "}
                Edit Your Profile for better recommendations{" "}
              </button>
            ) : (
              <button
                className="primary-btn"
                onClick={() => setShowProfileCard(true)}
              >
                {" "}
                Get Started - Set Up Your Profile{" "}
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
        {showProfileCard && (
          <ProfileCard onClose={() => setShowProfileCard(false)} />
        )}
      </main>
      <Footer />
    </>
  );
};

export default Home;
