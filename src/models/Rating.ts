import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: "default",
    },
    bookId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure one rating per user per book
ratingSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const Rating =
  mongoose.models?.Rating || mongoose.model("Rating", ratingSchema);