import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Rating } from "@/models/Rating";
import { UserState } from "@/models/UserState";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { bookId, rating } = await request.json();

    if (!bookId || rating === undefined) {
      return NextResponse.json(
        { error: "Book ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // For now, we'll use a hardcoded userId since we don't have authentication
    const userId = "default";

    // Update or create the rating for this book
    const existingRating = await Rating.findOne({ userId, bookId });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      await Rating.create({
        userId,
        bookId,
        rating,
      });
    }

    // Check if the book is currently in "reading" shelf and move it to "read" if so
    const userState = await UserState.findOne({ userId });
    
    if (userState && userState.readingIds.includes(bookId)) {
      // Remove from reading shelf
      userState.readingIds = userState.readingIds.filter((id: string) => id !== bookId);
      
      // Add to read shelf (only if not already there)
      if (!userState.readIds.includes(bookId)) {
        userState.readIds.push(bookId);
      }
      
      await userState.save();
    }

    return NextResponse.json({ 
      success: true, 
      rating,
      shelfMoved: userState?.readingIds.includes(bookId) ? true : false
    });
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const bookIds = searchParams.get("bookIds");

    // Handle batch request for multiple book ratings
    if (bookIds) {
      const bookIdArray = bookIds.split(",").filter(id => id.trim());
      
      if (bookIdArray.length === 0) {
        return NextResponse.json({ ratings: {} });
      }

      const userId = "default";
      const ratingDocs = await Rating.find({ 
        userId, 
        bookId: { $in: bookIdArray } 
      });

      // Create a map of bookId -> rating
      const ratingsMap = ratingDocs.reduce((acc, doc) => {
        acc[doc.bookId] = doc.rating;
        return acc;
      }, {} as Record<string, number>);

      return NextResponse.json({ ratings: ratingsMap });
    }

    // Handle single book rating request
    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID or book IDs are required" },
        { status: 400 }
      );
    }

    // Get the rating for this book
    const userId = "default";
    const ratingDoc = await Rating.findOne({ userId, bookId });

    return NextResponse.json({
      rating: ratingDoc?.rating || 0,
      hasRating: !!ratingDoc,
    });
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { error: "Failed to fetch rating" },
      { status: 500 }
    );
  }
}