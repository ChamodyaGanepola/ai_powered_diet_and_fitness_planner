import UserProfile from "../models/UserProfile.js";
import { calculateBMI, getBMICategory } from "../utils/bmi.js";

// Create profile
export const createProfile = async (req, res) => {
  try {
    console.log("Request body:", req.user.id, req.user.role);
    const user_id = req.user.id; // from authMiddleware
    const {
      age,
      gender,
      weight,
      height,
      fitnessGoal,
      activityLevel,
      dietaryRestrictions,
      healthConditions,
      workoutPreferences,
      culturalDietaryPatterns,
      days
    } = req.body;

    if (!user_id || !age || !gender || !weight || !height) {
      return res.status(400).json({ message: "user_id, age, gender, weight, and height are required" });
    }

    const existingProfile = await UserProfile.findOne({ user_id, status: "active" });
    if (existingProfile) {
      return res.status(400).json({ message: "Active profile already exists for this user", profile: existingProfile });
    }
    // Convert days to number (if provided)
    const daysNumber =
      days === undefined || days === null || isNaN(Number(days))
        ? 0
        : Number(days);

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
      days: daysNumber,
    });

    await profile.save();
    res.status(201).json({ message: "Profile created successfully", profile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile (creates a new active profile)
export const updateProfile = async (req, res) => {
  try {
    const user_id = req.user.id; // from authMiddleware
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
    // Convert days to number 
    const daysNumber = updateData.days !== undefined
      ? Number(updateData.days)
      : activeProfile.days;
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
      days: daysNumber,
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
export const getProfileByUserId = async (req, res) => {
  try {
    const user_id = req.user.id; // from authMiddleware
    console.log("Fetching profile for user ID:", user_id);
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
export const deleteProfile = async (req, res) => {
  try {
    const user_id = req.user.id; // from authMiddleware

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

