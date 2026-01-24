const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //  Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password :", password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // 5. Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response (NO password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER, 
      to: user.email,
      subject: "HealthPilot - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937;">
          <h2 style="color: #2d6a4f;">HealthPilot Password Reset</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>You recently requested to reset your password for your <strong>HealthPilot</strong> account.</p>
          
          <p>
            Click the button below to reset your password:
          </p>

          <a href="${resetLink}" 
             style="
               display: inline-block;
               padding: 12px 18px;
               margin: 10px 0;
               background: #295339;
               color: #fff;
               text-decoration: none;
               border-radius: 8px;
             ">
            Reset Password
          </a>

          <p style="margin-top: 10px;">
            This link will expire in <strong>15 minutes</strong>.
          </p>

          <p>If you did not request this, you can safely ignore this email.</p>
          <p>Thanks,<br/>The HealthPilot Team</p>
        </div>
      `
    });

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    //  assign plain text password only
    user.password = password;

    // Remove token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save(); // pre-save hook will hash it

    console.log("Password reset successful for:", user.email);

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
