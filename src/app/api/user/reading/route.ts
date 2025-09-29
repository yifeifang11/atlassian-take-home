import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserState } from "@/models/UserState";
import booksData from "@/data/books.json";

export async function GET() {
  try {
    await dbConnect();

    const userState = await UserState.findOne({ userId: "default" });

    if (!userState || userState.readingIds.length === 0) {
      return NextResponse.json({
        books: [],
        isEmpty: true,
      });
    }

    // Get the full book details for currently reading books
    const readingBooks = booksData.filter((book) =>
      userState.readingIds.includes(book.id.toString())
    );

    return NextResponse.json({
      books: readingBooks,
      isEmpty: false,
    });
  } catch (error) {
    console.error("Get currently reading books API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch currently reading books" },
      { status: 500 }
    );
  }
}
