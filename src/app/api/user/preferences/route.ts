import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserPreferences } from "@/models/UserPreferences";

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }

    await dbConnect();

    // For now, we'll use a hardcoded userId since we don't have authentication
    const userId = "default";

    const userPreferences = await UserPreferences.findOne({ userId });

    if (!userPreferences) {
      // Return default preferences if none exist
      const defaultPreferences = {
        favoriteGenres: ["Fiction", "Mystery", "Science Fiction"],
        preferredLength: "medium",
        readingGoal: 24,
        contentWarnings: ["violence", "explicit content"],
        languagePreference: "English",
      };
      return NextResponse.json(defaultPreferences);
    }

    // Return preferences without internal MongoDB fields
    const preferences = {
      favoriteGenres: userPreferences.favoriteGenres,
      preferredLength: userPreferences.preferredLength,
      readingGoal: userPreferences.readingGoal,
      contentWarnings: userPreferences.contentWarnings,
      languagePreference: userPreferences.languagePreference,
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch user preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const preferences = await request.json();

    // Validate required fields
    if (!preferences) {
      return NextResponse.json(
        { error: "Preferences data is required" },
        { status: 400 }
      );
    }

    // For now, we'll use a hardcoded userId since we don't have authentication
    const userId = "default";

    // Update or create user preferences
    const updatedPreferences = await UserPreferences.findOneAndUpdate(
      { userId },
      {
        userId,
        favoriteGenres: preferences.favoriteGenres || [],
        preferredLength: preferences.preferredLength || "medium",
        readingGoal: preferences.readingGoal || 24,
        contentWarnings: preferences.contentWarnings || [],
        languagePreference: preferences.languagePreference || "English",
      },
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return updated document
        runValidators: true, // Run schema validation
      }
    );

    // Return preferences without internal MongoDB fields
    const responsePreferences = {
      favoriteGenres: updatedPreferences.favoriteGenres,
      preferredLength: updatedPreferences.preferredLength,
      readingGoal: updatedPreferences.readingGoal,
      contentWarnings: updatedPreferences.contentWarnings,
      languagePreference: updatedPreferences.languagePreference,
    };

    return NextResponse.json({
      success: true,
      preferences: responsePreferences,
    });
  } catch (error) {
    console.error("Error saving user preferences:", error);
    return NextResponse.json(
      { error: "Failed to save user preferences" },
      { status: 500 }
    );
  }
}
