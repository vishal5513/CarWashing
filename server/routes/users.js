const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmail = require("../utils/sendEmail");

/* =====================================================
   PART 1️⃣ : SEND OTP (EMAIL VERIFICATION)
   ===================================================== */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 🔥 generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // delete old OTP
    await Otp.deleteMany({ email });

    // save new OTP
    await Otp.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // send email
    await sendEmail(
      email,
      "OTP Verification - Sparkling Car Wash",
      `
        <h2>Email Verification</h2>
        <p>Your OTP is <b>${otp}</b></p>
        <p>This OTP is valid for 5 minutes.</p>
      `
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* =====================================================
   PART 2️⃣ : VERIFY OTP + REGISTER USER
   ===================================================== */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      username,
      password,
      confirmPassword,
      gender,
      otp,
    } = req.body;

    // 🔒 basic validation
    if (
      !name ||
      !email ||
      !phone ||
      !username ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({ message: "All fields & OTP are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 🔥 verify OTP
    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP used → delete
    await Otp.deleteMany({ email });

    // 🔒 check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    // 🔐 hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      address,
      username,
      password: hashed,
      gender,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   LOGIN (NO CHANGE)
   ===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password required" });

    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(400)
        .json({ message: "Invalid username or password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
