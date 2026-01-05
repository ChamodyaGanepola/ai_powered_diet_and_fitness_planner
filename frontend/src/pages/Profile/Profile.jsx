import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaBirthdayCake,
  FaVenusMars,
  FaWeight,
  FaRulerVertical,
  FaBullseye,
  FaRunning,
  FaUtensils,
  FaHeart
} from "react-icons/fa";
import { getProfileByUserId } from "../../api/userProfileApi";
import "./Profile.css";
import { useAuth } from "../../context/authContext.jsx";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
const { user, profileUpdated } = useAuth();

useEffect(() => {
  const fetchProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getProfileByUserId(user.id);
      setProfile(data);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, [user?.id, profileUpdated]); //  refresh whenever profileUpdated changes


  if (loading) return <p className="loading">Loading profile...</p>;
  if (!profile) return <p className="loading">No profile found</p>;

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-header">
          <FaUser className="profile-avatar" />
          <h2>{profile.user_id?.username}</h2>
          <p>{profile.user_id?.email}</p>
        </div>

        <div className="profile-grid">
          <ProfileItem icon={<FaBirthdayCake />} label="Age" value={`${profile.age} yrs`} />
          <ProfileItem icon={<FaVenusMars />} label="Gender" value={profile.gender} />
          <ProfileItem icon={<FaWeight />} label="Weight" value={`${profile.weight} kg`} />
          <ProfileItem icon={<FaRulerVertical />} label="Height" value={`${profile.height} cm`} />
          <ProfileItem icon={<FaBullseye />} label="Fitness Goal" value={profile.fitnessGoal} />
          <ProfileItem icon={<FaRunning />} label="Activity Level" value={profile.activityLevel} />
        </div>

        <Section title="Dietary Restrictions" icon={<FaUtensils />} items={profile.dietaryRestrictions} />
        <Section title="Health Conditions" icon={<FaHeart />} items={profile.healthConditions} />
        <Section title="Preferences" icon={<FaUser />} items={profile.preferences} />
        <Section title="Cultural Dietary Patterns" icon={<FaUtensils />} items={profile.culturalDietaryPatterns} />
      </div>
      <Footer />
    </>
  );
};

const ProfileItem = ({ icon, label, value }) => (
  <div className="profile-item">
    <div className="icon">{icon}</div>
    <div>
      <span className="label">{label}</span>
      <p className="value">{value || "-"}</p>
    </div>
  </div>
);

const Section = ({ title, icon, items }) => (
  <div className="profile-section">
    <h3>{icon} {title}</h3>
    {items && items.length > 0 ? (
      <div className="chip-container">
        {items.map((item, index) => (
          <span key={index} className="chip">{item}</span>
        ))}
      </div>
    ) : (
      <p className="empty">None</p>
    )}
  </div>
);

export default Profile;
