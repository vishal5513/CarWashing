const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const jwt = require("jsonwebtoken");

// AUTH middleware (DEBUG VERSION)
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  console.log("TOKEN RECEIVED:", token);

  if (!token) {
    console.log("NO TOKEN");
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    console.log("DECODED TOKEN:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("TOKEN VERIFY ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// POST REVIEW (DEBUG)
router.post("/", auth, async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { rating, comment } = req.body;

    const review = new Review({
      name: req.user.username || "Anonymous",
      rating,
      comment,
    });

    await review.save();

    res.json({ message: "Review added successfully" });
  } catch (err) {
    console.log("SAVE REVIEW ERROR:", err.message);
    res.status(500).json({ message: "Error adding review" });
  }
});
router.get("/", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.json(reviews);
});

module.exports = router;
