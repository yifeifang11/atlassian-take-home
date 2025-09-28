import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  bookId: string;
  action: "like" | "dislike";
  timestamp: Date;
  query?: string;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    bookId: { type: String, required: true },
    action: { type: String, enum: ["like", "dislike"], required: true },
    timestamp: { type: Date, default: Date.now },
    query: { type: String },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ bookId: 1 });
FeedbackSchema.index({ timestamp: -1 });

export const Feedback =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
