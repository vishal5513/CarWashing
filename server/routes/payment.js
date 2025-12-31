const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// AUTH middleware
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/*
  1️⃣ CREATE FAKE PAYMENT ORDER
*/
router.post("/create", auth, (req, res) => {
  const { amount } = req.body;

  const fakeOrder = {
    orderId: "FAKE_ORDER_" + Date.now(),
    amount,
    currency: "INR",
    status: "created",
  };

  res.json(fakeOrder);
});

/*
  2️⃣ FAKE PAYMENT SUCCESS
*/
router.post("/success", auth, (req, res) => {
  const { orderId } = req.body;

  res.json({
    paymentId: "FAKE_PAY_" + Date.now(),
    orderId,
    status: "success",
    message: "Fake payment successful",
  });
});

module.exports = router;
