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
import { getProfileByUserId, deleteProfile } from "../../api/userProfileApi";
import { createNotification } from "../../api/notificationApi.js";

import "./Profile.css";
import { useAuth } from "../../context/authContext.jsx";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";

const Profile = () => {
  const { user, markProfileUpdated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getProfileByUserId(user.id);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
  const renderAvatar = () => {
  if (!profile?.gender) return <FaUser className="profile-avatar" />;

  const gender = profile.gender.toLowerCase();

  if (gender === "female") {
    return <FaFemale className="profile-avatar" />;
  }

  if (gender === "male") {
    return <FaMale className="profile-avatar" />;
  }

  return <FaUser className="profile-avatar" />;
};

  const handleDeleteProfile = async () => {
    try {
      await deleteProfile(user.id);
      setProfile(null);
      markProfileUpdated(); //  notify whole app
      setSuccessMsg("Successfully deleted your profile");
      //  Create delete notification
      await createNotification(user.id, `Hi ${user.username}, your user profile details have been deleted successfully.! 😢`);
      setTimeout(() => {
        setShowConfirm(false);
        setSuccessMsg("");
      }, 1500);
    } catch (err) {
      console.error("Profile delete failed", err);
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;

  return (
    <>
      <Header />

      <div className="profile-page">
        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar-wrapper">{renderAvatar()}</div>

          <h2>{user?.username}</h2>
          <p>{user?.email}</p>

          {/* DELETE BUTTON */}
          {profile && (
            <button
              className="delete-profile-btn"
              onClick={() => setShowConfirm(true)}
            >
              Delete Profile Details
            </button>
          )}
        </div>

        {/* PROFILE DATA */}
        {profile ? (
          <>
            <div className="profile-grid">
              <ProfileItem
                icon={<FaBirthdayCake />}
                label="Age"
                value={`${profile.age} yrs`}
              />
              <ProfileItem
                icon={<FaVenusMars />}
                label="Gender"
                value={profile.gender}
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
            </div>

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
              title="Preferences"
              icon={<FaUser />}
              items={profile.preferences}
            />
          </>
        ) : (
          <p className="empty">No data available</p>
        )}
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
