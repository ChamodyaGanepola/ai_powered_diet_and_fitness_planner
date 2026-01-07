import React from "react";
import "./Dashboard.css";
import StatCard from "../../component/Dashboard/StatCard.jsx";
import ActivityCard from "../../component/Dashboard/ActivityCard.jsx";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import { useAuth } from "../../context/authContext.jsx";
export default function Dashboard() {
  const { user } = useAuth(); // listen to global profile updates
  return (
    <><Header />
    <div className="dashboard-root">
      <main className="dashboard-main">
        <section className="welcome">
          <h3>Welcome Back,</h3>
          <h1>{user.username}</h1>

          <div className="stats">
            <StatCard icon="👣" title="Steps" value="9300" color="blue" />
            <StatCard icon="🔥" title="Calories" value="2900" color="orange" />
            <StatCard icon="🥗" title="Progress" value="86" color="green" />
          </div>
        </section>

        <section className="activities">
          <ActivityCard
            title="Yoga"
            subtitle="2 hours today"
            type="yoga"
          />
          <ActivityCard
            title="Cycling"
            subtitle="3.5 km today"
            type="cycling"
          />
          <ActivityCard
            title="Running"
            subtitle="2.8 km today"
            type="running"
          />
          <ActivityCard title="Gym" subtitle="2.6 hours today" type="gym" />
        </section>
      </main>
    </div>
    <Footer />
    </>

  );
}
