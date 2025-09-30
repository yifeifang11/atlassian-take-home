import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserState } from "@/models/UserState";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { bookId, shelf } = await req.json();

    if (!bookId || !shelf) {
      return NextResponse.json(
        { error: "Book ID and shelf are required" },
        { status: 400 }
      );
    }

    if (!["read", "toRead", "reading"].includes(shelf)) {
      return NextResponse.json(
        { error: "Invalid shelf type" },
        { status: 400 }
      );
    }

    // Get or create user state
    let userState = await UserState.findOne({ userId: "default" });

    if (!userState) {
      userState = new UserState({
        userId: "default",
        readIds: [],
        toReadIds: [],
        readingIds: [],
        favoriteIds: [],
        feedbackHistory: [],
      });
    }

    // Remove book from all shelves first (prevent duplicates)
    userState.readIds = userState.readIds.filter((id: string) => id !== bookId);
    userState.toReadIds = userState.toReadIds.filter(
      (id: string) => id !== bookId
    );
    userState.readingIds = userState.readingIds.filter(
      (id: string) => id !== bookId
    );

    // Add to appropriate shelf
    switch (shelf) {
      case "read":
        userState.readIds.push(bookId);
        break;
      case "toRead":
        userState.toReadIds.push(bookId);
        break;
      case "reading":
        userState.readingIds.push(bookId);
        break;
    }

    await userState.save();

    return NextResponse.json({
      success: true,
      shelf,
      counts: {
        read: userState.readIds.length,
        toRead: userState.toReadIds.length,
        reading: userState.readingIds.length,
      },
    });
  } catch (error) {
    console.error("User books API error:", error);
    return NextResponse.json(
      { error: "Failed to update book shelf" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { bookId } = await req.json();

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    // Get user state
    const userState = await UserState.findOne({ userId: "default" });

    if (!userState) {
      return NextResponse.json(
        { error: "User state not found" },
        { status: 404 }
      );
    }

    // Remove book from all shelves
    userState.readIds = userState.readIds.filter((id: string) => id !== bookId);
    userState.toReadIds = userState.toReadIds.filter(
      (id: string) => id !== bookId
    );
    userState.readingIds = userState.readingIds.filter(
      (id: string) => id !== bookId
    );

    await userState.save();

    return NextResponse.json({
      success: true,
      message: "Book removed from all shelves",
      counts: {
        read: userState.readIds.length,
        toRead: userState.toReadIds.length,
        reading: userState.readingIds.length,
      },
    });
  } catch (error) {
    console.error("Delete book API error:", error);
    return NextResponse.json(
      { error: "Failed to remove book from shelf" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }

    await dbConnect();
    const userState = await UserState.findOne({ userId: "default" });

    if (!userState) {
      return NextResponse.json({
        read: [],
        toRead: [],
        reading: [],
        favorites: [],
      });
    }

    return NextResponse.json({
      read: userState.readIds || [],
      toRead: userState.toReadIds || [],
      reading: userState.readingIds || [],
      favorites: userState.favoriteIds || [],
    });
  } catch (error) {
    console.error("Get user books API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user books" },
      { status: 500 }
    );
  }
}
