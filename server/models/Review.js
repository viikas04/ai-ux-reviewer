import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  url: { type: String, required: true },
  score: { type: Number, required: true },
  review: { type: Object, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Review", reviewSchema);