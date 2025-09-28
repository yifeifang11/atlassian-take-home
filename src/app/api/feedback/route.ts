import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Feedback } from "@/models/Feedback";
import { UserState } from "@/models/UserState";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { bookId, action, query } = await req.json();

    if (!bookId || !action) {
      return NextResponse.json(
        { error: "Book ID and action are required" },
        { status: 400 }
      );
    }

    if (!["like", "dislike"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be like or dislike" },
        { status: 400 }
      );
    }

    // Save feedback
    const feedback = new Feedback({
      bookId,
      action,
      query: query || "",
      timestamp: new Date(),
    });
    await feedback.save();

    // Update user state feedback history (for single user app)
    const userState = await UserState.findOneAndUpdate(
      { userId: "default" },
      {
        $push: {
          feedbackHistory: {
            bookId,
            action,
            query: query || "",
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      feedbackId: feedback._id,
      userState: userState.feedbackHistory.length,
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
