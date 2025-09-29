import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UserState } from "@/models/UserState";
import { Book } from "@/models/Book";
import booksData from "@/data/books.json";

export async function POST() {
  try {
    console.log("Setup API called");
    await dbConnect();
    console.log("Database connected successfully");

    // First, populate books if the database is empty or has fewer books than JSON
    const existingBooksCount = await Book.countDocuments();
    console.log("Existing books count:", existingBooksCount);
    console.log("JSON books count:", booksData.length);
    let booksPopulated = false;

    if (existingBooksCount === 0 || existingBooksCount < booksData.length) {
      console.log("Populating books database...");

      // Use upsert to handle duplicates - this will update existing books or insert new ones
      const booksToUpsert = booksData.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        genres: book.genres || [],
        description: book.description,
        coverUrl: book.coverUrl,
      }));

      console.log(`Attempting to upsert ${booksToUpsert.length} books`);

      // Use bulkWrite with upsert operations to handle duplicates
      const bulkOps = booksToUpsert.map((book) => ({
        updateOne: {
          filter: { id: book.id },
          update: { $set: book },
          upsert: true,
        },
      }));

      const result = await Book.bulkWrite(bulkOps);
      booksPopulated = true;
      console.log(
        `Successfully upserted books: ${result.upsertedCount} new, ${result.modifiedCount} updated`
      );
    } else {
      console.log(`Database already has ${existingBooksCount} books`);
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

    // Prepopulate with some books if empty
    if (userState.readIds.length === 0) {
      userState.readIds = [
        "educated",
        "where_crawdads_sing",
        "the_midnight_library",
        "klara_and_sun",
      ];
    }

    if (userState.toReadIds.length === 0) {
      userState.toReadIds = [
        "dune",
        "sapiens",
        "circe",
        "normal_people",
        "song_of_achilles",
        "great_gatsby",
        "becoming",
        "atomic_habits",
      ];
    }

    if (userState.readingIds.length === 0) {
      userState.readingIds = ["1984", "pride_prejudice"];
    }

    await userState.save();

    return NextResponse.json({
      success: true,
      message: "User bookshelves prepopulated",
      booksPopulated,
      booksCount: booksPopulated ? booksData.length : existingBooksCount,
      jsonBooksCount: booksData.length,
      existingBooksCount,
      counts: {
        read: userState.readIds.length,
        toRead: userState.toReadIds.length,
        reading: userState.readingIds.length,
      },
    });
  } catch (error) {
    console.error("Setup API error:", error);
    return NextResponse.json(
      { error: "Failed to setup user data" },
      { status: 500 }
    );
  }
}
