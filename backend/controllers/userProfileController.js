const UserProfile = require("../models/UserProfile");
const { calculateBMI, getBMICategory } = require("../utils/bmi");

// Create profile
exports.createProfile = async (req, res) => {
  try {
    const {
      user_id,
      age,
      gender,
      weight,
      height,
      fitnessGoal,
      activityLevel,
      dietaryRestrictions,
      healthConditions,
      workoutPreferences,
      culturalDietaryPatterns
    } = req.body;

    if (!user_id || !age || !gender || !weight || !height) {
      return res.status(400).json({ message: "user_id, age, gender, weight, and height are required" });
    }

    const existingProfile = await UserProfile.findOne({ user_id, status: "active" });
    if (existingProfile) {
      return res.status(400).json({ message: "Active profile already exists for this user", profile: existingProfile });
    }

    const bmi = calculateBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);

    const profile = new UserProfile({
      user_id,
      age,
      gender,
      weight,
      height,
      fitnessGoal: fitnessGoal || "",
      activityLevel: activityLevel || "",
      dietaryRestrictions: dietaryRestrictions || [],
      healthConditions: healthConditions || [],
      workoutPreferences,
      culturalDietaryPatterns: culturalDietaryPatterns || [],
      bmi,
      bmiCategory,
      status: "active",
    });

    await profile.save();
    res.status(201).json({ message: "Profile created successfully", profile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile (creates a new active profile)
exports.updateProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const updateData = req.body;

    // Find the existing active profile
    const activeProfile = await UserProfile.findOne({ user_id, status: "active" });
    if (!activeProfile) {
      return res.status(404).json({ message: "Active profile not found" });
    }

    // Mark old profile as updated
    activeProfile.status = "updated";
    await activeProfile.save();

    // Recalculate BMI if weight or height is updated
    const weight = updateData.weight || activeProfile.weight;
    const height = updateData.height || activeProfile.height;
    const bmi = calculateBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);

    // Create a new profile with updated data and status active
    const newProfile = new UserProfile({
      user_id,
      age: updateData.age || activeProfile.age,
      gender: updateData.gender || activeProfile.gender,
      weight,
      height,
      fitnessGoal: updateData.fitnessGoal || activeProfile.fitnessGoal,
      activityLevel: updateData.activityLevel || activeProfile.activityLevel,
      dietaryRestrictions: updateData.dietaryRestrictions || activeProfile.dietaryRestrictions,
      healthConditions: updateData.healthConditions || activeProfile.healthConditions,
      workoutPreferences: updateData.workoutPreferences || activeProfile.workoutPreferences,
      culturalDietaryPatterns: updateData.culturalDietaryPatterns || activeProfile.culturalDietaryPatterns,
      bmi,
      bmiCategory,
      status: "active"
    });

    await newProfile.save();
    res.status(200).json({ message: "Profile updated successfully", profile: newProfile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get profile by user_id (only active)
exports.getProfileByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const profile = await UserProfile.findOne({ user_id, status: "active" })
      .populate("user_id", "username email");

    if (!profile) {
      return res.status(404).json({ message: "Active profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// Delete profile by user_id
exports.deleteProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const profile = await UserProfile.findOneAndDelete({ user_id, status: "active" });
    if (!profile) {
      return res.status(404).json({ message: "Active profile not found" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

