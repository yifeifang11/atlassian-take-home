import mongoose, { Schema, Document } from "mongoose";

export interface IRecommendationFeedback extends Document {
  userId: string;
  query: string;
  feedback: "liked" | "disliked";
  reasons?: string[];
  customFeedback?: string;
  recommendedBooks: string[]; // Array of book IDs that were recommended
  createdAt: Date;
}

const RecommendationFeedbackSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    default: "default",
  },
  query: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    enum: ["liked", "disliked"],
    required: true,
  },
  reasons: [
    {
      type: String,
    },
  ],
  customFeedback: {
    type: String,
    default: "",
  },
  recommendedBooks: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for efficient querying
RecommendationFeedbackSchema.index({ userId: 1, createdAt: -1 });
RecommendationFeedbackSchema.index({ userId: 1, feedback: 1 });

export const RecommendationFeedback =
  mongoose.models.RecommendationFeedback ||
  mongoose.model<IRecommendationFeedback>(
    "RecommendationFeedback",
    RecommendationFeedbackSchema
  );
