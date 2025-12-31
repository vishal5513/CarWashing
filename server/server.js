require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const reviewRoutes = require("./routes/reviews");
const usersRouter = require("./routes/users");
const bookingRoutes = require("./routes/bookings");
const pincodeRoutes = require("./routes/pincodeRoutes");
const paymentRoutes = require("./routes/payment");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/pincode", pincodeRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

if (!MONGO) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
  });
