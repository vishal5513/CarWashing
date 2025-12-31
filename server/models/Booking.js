const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // 🔹 USER INFO
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: String,
    userEmail: String,

    // 🔹 VEHICLE & SERVICE DETAILS
    vehicleType: String,
    vehicleNumber: String,
    fuelType: String,
    parkingPlace: String,
    date: String,
    timeSlot: String,
    address: String,

    service: String,
    cleanType: String,
    totalPrice: Number,

    // 🔹 PAYMENT DETAILS (FAKE PAYMENT)
    paymentMode: String,
    paymentId: String,
    paymentStatus: {
    type: String,
    default: "Pending",
 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
