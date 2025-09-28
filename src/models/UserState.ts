import mongoose, { Schema, Document } from "mongoose";

export interface IUserState extends Document {
  userId: string;
  favoriteIds: string[];
  readIds: string[];
  toReadIds: string[];
  readingIds: string[];
  feedbackHistory: Array<{
    bookId: string;
    action: "like" | "dislike";
    timestamp: Date;
    query?: string;
  }>;
}

const UserStateSchema = new Schema<IUserState>(
  {
    userId: { type: String, required: true, unique: true, default: "default" },
    favoriteIds: [{ type: String }],
    readIds: [{ type: String }],
    toReadIds: [{ type: String }],
    readingIds: [{ type: String }],
    feedbackHistory: [
      {
        bookId: { type: String, required: true },
        action: { type: String, enum: ["like", "dislike"], required: true },
        timestamp: { type: Date, default: Date.now },
        query: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const UserState =
  mongoose.models.UserState ||
  mongoose.model<IUserState>("UserState", UserStateSchema);
