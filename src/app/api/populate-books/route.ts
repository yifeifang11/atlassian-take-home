import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Book } from "@/models/Book";
import booksData from "@/data/books.json";

export async function POST() {
  try {
    await dbConnect();

    // Check if books already exist in the database
    const existingBooksCount = await Book.countDocuments();

    if (existingBooksCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already contains ${existingBooksCount} books. Use force=true to repopulate.`,
        existingCount: existingBooksCount,
        jsonCount: booksData.length,
      });
    }

    // Insert all books from JSON into MongoDB
    const booksToInsert = booksData.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      genres: book.genres || [],
      description: book.description,
      coverUrl: book.coverUrl,
      // We'll skip embedding for now, can be added later if needed
    }));

    const result = await Book.insertMany(booksToInsert, { ordered: false });

    return NextResponse.json({
      success: true,
      message: `Successfully populated database with ${result.length} books`,
      insertedCount: result.length,
      totalBooks: booksData.length,
    });
  } catch (error: unknown) {
    console.error("Populate books API error:", error);

    // Handle duplicate key errors gracefully
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Some books already exist in the database",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to populate books",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await dbConnect();

    const result = await Book.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} books from database`,
      deletedCount: result.deletedCount,
    });
  } catch (error: unknown) {
    console.error("Delete books API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete books",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
