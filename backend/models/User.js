const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Hash email before saving
userSchema.pre("save", async function() {
  if (this.isModified("email")) {
    const salt = await bcrypt.genSalt(10);
    this.email = await bcrypt.hash(this.email, salt);
  }
  // no next() needed
});

const User = mongoose.model("User", userSchema);
module.exports = User;
