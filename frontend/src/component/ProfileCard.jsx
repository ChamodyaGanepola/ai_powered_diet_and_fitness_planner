import "./ProfileCard.css";

const ProfileCard = ({ onClose }) => {
  return (
    <div className="profile-overlay">
      <div className="profile-card">
        <h2>👤 Set Up Your Health Profile</h2>
        <p>
          Complete your profile to get personalized AI-powered diet and fitness
          plans
        </p>

        <form className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Age *</label>
              <input type="number" min="13" max="120" required />
            </div>

            <div className="form-group">
              <label>Gender *</label>
            
                 <select required defaultValue="">
              <option value="" disabled>
                Select Gender
              </option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg) *</label>
              <input type="number" min="0" required />
            </div>

            <div className="form-group">
              <label>Height (cm) *</label>
              <input type="number" min="0" required />
            </div>
          </div>

          <div className="form-group">
            <label>Fitness Goal *</label>
            <select required defaultValue="">
              <option value="" disabled>
                Select Level
              </option>
              <option>Weight Loss</option>
              <option>Muscle Gain</option>
              <option>Maintain Fitness</option>
              <option>Improve Endurance</option>
            </select>
          </div>

          <div className="form-group">
            <label>Activity Level *</label>
            <select required defaultValue="">
              <option value="" disabled>
                Select Level
              </option>
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
            </select>
          </div>

          {/* Optional fields */}
          <div className="form-group">
            <label>Dietary Restrictions</label>
            <input type="text" placeholder="e.g. Vegan, Gluten-free" />
          </div>

          <div className="form-group">
            <label>Health Conditions</label>
            <input type="text" placeholder="e.g. Diabetes, BP" />
          </div>

          <button className="primary-btn" type="submit">
            💾 Save Profile & Continue
          </button>
        </form>

        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
