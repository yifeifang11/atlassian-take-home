import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { UserState } from "@/models/UserState";
import booksData from "@/data/books.json";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shelf = searchParams.get("shelf");

    // If no shelf parameter, return all books from JSON data
    if (!shelf) {
      return NextResponse.json(booksData);
    }

    // Original shelf-based logic
    await dbConnect();

    if (!["read", "toRead", "reading", "favorites"].includes(shelf)) {
      return NextResponse.json(
        { error: "Invalid shelf parameter" },
        { status: 400 }
      );
    }

    // Get user state
    const userState = await UserState.findOne({ userId: "default" });

    if (!userState) {
      return NextResponse.json({ books: [] });
    }

    let bookIds: string[] = [];
    switch (shelf) {
      case "read":
        bookIds = userState.readIds;
        break;
      case "toRead":
        bookIds = userState.toReadIds;
        break;
      case "reading":
        bookIds = userState.readingIds;
        break;
      case "favorites":
        bookIds = userState.favoriteIds;
        break;
    }

    // Fetch book details from MongoDB first
    const books = await Book.find({ id: { $in: bookIds } })
      .select("-embedding")
      .lean();

    // If no books found in MongoDB, fall back to JSON data
    if (books.length === 0 && bookIds.length > 0) {
      const jsonBooks = booksData.filter((book) => bookIds.includes(book.id));
      return NextResponse.json({
        books: jsonBooks.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          genres: book.genres || [],
          description: book.description,
          coverUrl: book.coverUrl,
        })),
        total: jsonBooks.length,
      });
    }

    return NextResponse.json({
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        genres: book.genres || [],
        description: book.description,
        coverUrl: book.coverUrl,
      })),
      total: books.length,
    });
  } catch (error) {
    console.error("Books API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
