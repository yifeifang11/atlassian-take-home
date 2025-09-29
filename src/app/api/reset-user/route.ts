import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserState } from "@/models/UserState";

export async function POST() {
  try {
    await dbConnect();

    // Delete the existing user state
    await UserState.deleteOne({ userId: "default" });

    return NextResponse.json({
      success: true,
      message: "User state reset successfully",
    });
  } catch (error) {
    console.error("Reset user API error:", error);
    return NextResponse.json(
      { error: "Failed to reset user state" },
      { status: 500 }
    );
  }
}
