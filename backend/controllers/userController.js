const User = require("../models/User");

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // Validate request
    if (!username || !email) {
      return res.status(400).json({ message: "Username and email are required" });
    }
    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    // Create user
    const user = new User({ username, email, role });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); // Get all users from DB
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
