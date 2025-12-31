const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    comment: String,
    rating: Number,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
