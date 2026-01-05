import Header from "../../component/Header.jsx";
import "./Home.css";

const Home = () => {
  return (
    <>
      <Header />

      <main className="home">
     
        <section className="hero">
          <h1>Welcome to Your AI Diet Fitness Planner</h1>
          <p>
            Your personalized health and fitness assistant powered by AI
          </p>

          <button className="primary-btn">
            Get Started - Set Up Your Profile
          </button>
        </section>

        {/* Features */}
        <section className="features">
          <div className="feature-card">
            <h3>🥗 Personalized Diet Plans</h3>
            <p>
              AI-generated meal plans based on your goals and preferences
            </p>
          </div>

          <div className="feature-card">
            <h3>💪 Custom Workouts</h3>
            <p>
              Tailored exercise routines for your fitness level and equipment
            </p>
          </div>

          <div className="feature-card">
            <h3>📊 Progress Tracking</h3>
            <p>
              Monitor your journey with detailed analytics and insights
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
