import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaMale,
  FaFemale,
  FaBirthdayCake,
  FaVenusMars,
  FaWeight,
  FaRulerVertical,
  FaBullseye,
  FaRunning,
  FaUtensils,
  FaHeart,
} from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { getProfileByUserId, deleteProfile } from "../../api/userProfileApi";
import { createNotification } from "../../api/notificationApi.js";
import PageLayout from "../../layouts/PageLayout.jsx";
import "./Profile.css";
import { useAuth } from "../../context/authContext.jsx";

const Profile = () => {
  const { user, markProfileUpdated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const getBMIPercentage = (bmi) => {
    const maxBMI = 40;
    const value = Number(bmi);
    if (!value || value <= 0) return 0;
    const percent = Math.min((value / maxBMI) * 100, 100);
    return percent;
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getProfileByUserId();
      if (!data?._id) {
        setProfile(false);
        setTimeout(() => (window.location.href = "/home"), 3000);
      }
      setProfile(data);
      console.log("Fetched profile data in Profile page:", data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const renderAvatar = () => {
    if (!profile?.gender) return <FaUser className="profile-avatar" />;

    const gender = profile.gender.toLowerCase();
    if (gender === "female") return <FaFemale className="profile-avatar" />;
    if (gender === "male") return <FaMale className="profile-avatar" />;
    return <FaUser className="profile-avatar" />;
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteProfile();
      setProfile(null);
      markProfileUpdated();
      setSuccessMsg("Successfully deleted your profile");
      await createNotification(
        `Hi ${user.username}, your user profile details have been deleted successfully.! 😢`,
      );
      setTimeout(() => {
        setShowConfirm(false);
        setSuccessMsg("");
      }, 1500);
    } catch (err) {
      console.error("Profile delete failed", err);
    }
  };

  const getBMIClass = (category) => {
    switch (category) {
      case "Underweight":
        return "underweight";
      case "Normal weight":
        return "normal";
      case "Overweight":
        return "overweight";
      case "Obesity":
        return "obese";
      default:
        return "normal";
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;

  if (!profile) {
    return (
      <div className="app-container">
        <p className="simple-message">
          Hey {user.username}, first create your profile. Redirecting to home...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="profile-page">
         <div className="profile-layout-inner">
        <div className="profile-layout">
          {/* HEADER */}
          <div className="profile-header">
            <div className="avatar-wrapper">{renderAvatar()}</div>
            <h2>{user?.username}</h2>
            <p>{user?.email}</p>

            <button
              className="delete-profile-btn"
              onClick={() => setShowConfirm(true)}
            >
               <FaTrash />
              Delete Profile Details
            </button>
          </div>

          {/* CARDS (NO profile-grid wrapper) */}
          <ProfileItem
            icon={<FaBirthdayCake />}
            label="Age"
            value={`${profile.age} yrs`}
          />
          <ProfileItem
            icon={<FaWeight />}
            label="Weight"
            value={`${profile.weight} kg`}
          />
          <ProfileItem
            icon={<FaRulerVertical />}
            label="Height"
            value={`${profile.height} cm`}
          />
          <ProfileItem
            icon={<FaBullseye />}
            label="Fitness Goal"
            value={profile.fitnessGoal}
          />
          <ProfileItem
            icon={<FaRunning />}
            label="Activity Level"
            value={profile.activityLevel}
          />

          {/* BMI CARD */}
          <div className="bmi-card">
            <div className="bmi-card-left">
              <div className="bmi-value">
                <FaHeart /> BMI {profile.bmi}
              </div>
              <div className="bmi-category">
                BMI Category {profile.bmiCategory}
              </div>
            </div>

            <div className="bmi-card-right">
              <div className="bmi-scale">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>

              <div className="bmi-bar">
                <div
                  className={`bmi-progress ${getBMIClass(profile.bmiCategory)}`}
                  style={{ width: `${getBMIPercentage(profile.bmi)}%` }}
                />
              </div>

              <p className="bmi-note">
                BMI shows your body weight relative to your height.
              </p>
            </div>
          </div>
        </div>
  </div>
        {/* PROFILE SECTIONS */}
        <div className="profile-sections-row">
          <Section
            title="Dietary Restrictions"
            icon={<FaUtensils />}
            items={profile.dietaryRestrictions}
          />
          <Section
            title="Health Conditions"
            icon={<FaHeart />}
            items={profile.healthConditions}
          />
          <Section
            title="Workout Preferences"
            icon={<FaUser />}
            items={
              profile.workoutPreferences ? [profile.workoutPreferences] : []
            }
          />
        
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            {successMsg ? (
              <p className="success">{successMsg}</p>
            ) : (
              <>
                <p>Are you sure you want to delete your profile details?</p>
                <div className="confirm-actions">
                  <button className="danger-btn" onClick={handleDeleteProfile}>
                    Yes
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => setShowConfirm(false)}
                  >
                    No
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
    <h3>
      {icon} {title}
    </h3>
    {items?.length ? (
      <div className="chip-container">
        {items.map((item, i) => (
          <span key={i} className="chip">
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="empty">None</p>
    )}
  </div>
);

export default Profile;
