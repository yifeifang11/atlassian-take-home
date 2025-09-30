import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { RecommendationFeedback } from "@/models/RecommendationFeedback";

export async function POST(req: NextRequest) {
  try {
    const { query, feedback, reasons, customFeedback, recommendedBooks } =
      await req.json();

    // Validate required fields
    if (!query || !feedback || !recommendedBooks) {
      return NextResponse.json(
        {
          error: "Query, feedback, and recommended books are required",
        },
        { status: 400 }
      );
    }

    if (!["liked", "disliked"].includes(feedback)) {
      return NextResponse.json(
        {
          error: "Feedback must be 'liked' or 'disliked'",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Create feedback record
    const feedbackRecord = new RecommendationFeedback({
      userId: "default", // In a real app, this would come from authentication
      query,
      feedback,
      reasons: reasons || [],
      customFeedback: customFeedback || "",
      recommendedBooks,
    });

    await feedbackRecord.save();

    console.log(`Feedback saved: ${feedback} for query "${query}"`);

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Recommendation feedback API error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "default";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Connect to database
    await dbConnect();

    // Get recent feedback for this user
    const feedback = await RecommendationFeedback.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Get feedback API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve feedback" },
      { status: 500 }
    );
  }
}
