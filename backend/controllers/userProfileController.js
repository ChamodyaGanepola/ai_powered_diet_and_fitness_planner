const UserProfile = require("../models/UserProfile");

//  Create profile (only if it does not exist)
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
      preferences,
      culturalDietaryPatterns
    } = req.body;

    // Validate required fields
    if (!user_id || !age || !gender || !weight || !height) {
      return res.status(400).json({ message: "user_id, age, gender, weight, and height are required" });
    }

    // Check if profile already exists
    const existingProfile = await UserProfile.findOne({ user_id });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this user", profile: existingProfile });
    }

    // Create new profile
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
      preferences: preferences || [],
      culturalDietaryPatterns: culturalDietaryPatterns || []
    });

    await profile.save();

    res.status(201).json({ message: "Profile created successfully", profile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile by user_id
exports.updateProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const updateData = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { user_id },
      updateData,
      { new: true, runValidators: true } // returns updated 
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", profile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//  Get profile by user_id
exports.getProfileByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const profile = await UserProfile.findOne({ user_id }).populate("user_id", "username email");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
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

    const profile = await UserProfile.findOneAndDelete({ user_id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
