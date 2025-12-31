const express = require("express");
const router = express.Router();
const Pincode = require("../models/Pincode");

router.post("/check", async (req, res) => {
  const { pincode } = req.body;

  // basic validation
  if (!pincode || pincode.length !== 6) {
    return res.json({
      available: false,
      message: "Please enter valid pincode"
    });
  }

  // 🔥 MAIN LOGIC
  const area = await Pincode.findOne({ pincode });

  if (!area) {
    return res.json({
      available: false,
      message: "Service not available in your area 😔"
    });
  }

  // pincode found in DB
  res.json({
    available: true,
    area: area.area
  });
});

module.exports = router;
