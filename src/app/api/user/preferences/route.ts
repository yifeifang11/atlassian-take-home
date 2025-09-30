import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserPreferences } from "@/models/UserPreferences";

export async function GET() {
  try {
    console.log("GET /api/user/preferences - Starting request");
    
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not set");
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }

    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected successfully");

    // For now, we'll use a hardcoded userId since we don't have authentication
    const userId = "default";

    const userPreferences = await UserPreferences.findOne({ userId });
    console.log("User preferences found:", !!userPreferences);

    if (!userPreferences) {
      console.log("No user preferences found, returning defaults");
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

    console.log("Returning user preferences");
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      mongoUri: process.env.MONGODB_URI ? "Set" : "Not set",
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch user preferences",
        details: error instanceof Error ? error.message : "Unknown error"
      },
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
