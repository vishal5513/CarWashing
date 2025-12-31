const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");

/* ================= AUTH MIDDLEWARE ================= */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Token format invalid" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= CREATE BOOKING + SEND EMAIL ================= */
router.post("/", auth, async (req, res) => {
  try {
    // 🔹 Find logged-in user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Create booking
    const booking = new Booking({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      ...req.body,
    });

    await booking.save();

    // 🔹 SEND EMAIL RECEIPT (AFTER SAVE)
    await sendEmail(
      user.email, // 👈 USER KA EMAIL
      "Payment Receipt - Sparkling Car Wash",
      `
        <h2>Payment Successful ✅</h2>

        <p>Hi ${user.name},</p>

        <p>Your car wash booking has been confirmed.</p>

        <hr/>

        <p><b>Vehicle:</b> ${req.body.vehicleType}</p>
        <p><b>Vehicle No:</b> ${req.body.vehicleNumber}</p>
        <p><b>Service:</b> ${req.body.service}</p>
        <p><b>Payment Mode:</b> ${req.body.paymentMode}</p>
        <p><b>Amount Paid:</b> ₹${req.body.totalPrice}</p>
        <p><b>Payment ID:</b> ${req.body.paymentId}</p>

        <hr/>
        <p>Thank you for choosing Sparkling Car Wash 🚗✨</p>
      `
    );

    // 🔹 FINAL RESPONSE
    res.json({
      message: "Booking saved & email sent successfully",
      bookingId: booking._id,
    });

  } catch (err) {
    console.error("Booking error FULL:", err);
    res.status(500).json({ message: "Booking failed" });
  }
});

/* ================= GET MY BOOKINGS (FULL HISTORY) ================= */
router.get("/my", auth, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const bookings = await Booking.find({
      userId: userObjectId,
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Fetch bookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});


/* ================= CANCEL BOOKING + REASON + EMAIL ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Cancel reason required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔐 user sirf apni booking cancel kar sakta hai
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const user = await User.findById(req.userId);

    // ❌ delete booking
    await Booking.findByIdAndDelete(req.params.id);

    // ✉️ cancellation email
    await sendEmail(
      user.email,
      "Booking Cancelled - Sparkling Car Wash",
      `
        <h2>Booking Cancelled ❌</h2>

        <p>Hi ${user.name},</p>

        <p>Your booking has been cancelled successfully.</p>

        <hr/>

        <p><b>Vehicle:</b> ${booking.vehicleType}</p>
        <p><b>Vehicle No:</b> ${booking.vehicleNumber}</p>
        <p><b>Date:</b> ${booking.date}</p>
        <p><b>Time:</b> ${booking.timeSlot}</p>
        <p><b>Amount:</b> ₹${booking.totalPrice}</p>
        <p><b>Cancel Reason:</b> ${reason}</p>

        <hr/>
        <p>If you have any questions, please contact us.</p>
        <p>— Sparkling Car Wash 🚗✨</p>
      `
    );

    res.json({ message: "Booking cancelled & email sent" });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Cancel booking failed" });
  }
});

module.exports = router;
