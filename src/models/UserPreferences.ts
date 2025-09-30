import mongoose from "mongoose";

export interface IUserPreferences {
  userId: string;
  favoriteGenres: string[];
  preferredLength: string;
  readingGoal: number;
  contentWarnings: string[];
  languagePreference: string;
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new mongoose.Schema<IUserPreferences>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    favoriteGenres: {
      type: [String],
      default: ["Fiction", "Mystery", "Science Fiction"],
    },
    preferredLength: {
      type: String,
      enum: ["short", "medium", "long", "any"],
      default: "medium",
    },
    readingGoal: {
      type: Number,
      min: 1,
      max: 1000,
      default: 24,
    },
    contentWarnings: {
      type: [String],
      default: [],
    },
    languagePreference: {
      type: String,
      default: "English",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create index on userId for fast lookups
userPreferencesSchema.index({ userId: 1 });

export const UserPreferences =
  mongoose.models.UserPreferences ||
  mongoose.model<IUserPreferences>("UserPreferences", userPreferencesSchema);
