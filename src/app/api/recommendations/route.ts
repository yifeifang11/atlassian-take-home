import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Book } from "@/models/Book";
import { openLibraryService } from "@/lib/openLibrary";
import { openaiService } from "@/lib/openai";

// Type guard for MongoDB duplicate key errors
function isMongoDBDuplicateError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // First, try to get recommendations from existing books in database
    const books = await Book.find().limit(100).lean();

    // If we have few books, fetch some from Open Library based on the query
    if (books.length < 20) {
      console.log("Fetching new books from Open Library...");
      const newBooks = await openLibraryService.searchAndConvert(query, 20);

      // Store books and generate embeddings
      for (const bookData of newBooks) {
        try {
          // Check if book already exists
          const existingBook = await Book.findOne({ id: bookData.id });
          if (existingBook) continue;

          // Generate embedding
          const embedding = await openaiService.generateBookEmbedding(bookData);

          // Save to database
          const book = new Book({
            ...bookData,
            embedding,
          });
          await book.save();
          books.push(book.toObject());
        } catch (error) {
          // Handle duplicate key errors gracefully
          if (isMongoDBDuplicateError(error)) {
            console.log(`Book ${bookData.id} already exists, skipping...`);
          } else {
            console.error(`Error processing book ${bookData.id}:`, error);
          }
        }
      }
    }

    // Generate query embedding
    const queryEmbedding = await openaiService.generateEmbedding(query);

    // Find similar books
    const booksWithEmbeddings = books
      .filter((book) => book.embedding && book.embedding.length > 0)
      .map((book) => ({
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          genres: book.genres || [],
          description: book.description,
          coverUrl: book.coverUrl,
          openLibraryId: book.openLibraryId || book.id,
        },
        embedding: book.embedding as number[],
      }));

    const similarBooks = await openaiService.findSimilarBooks(
      queryEmbedding,
      booksWithEmbeddings,
      8
    );

    // Generate explanations
    const recommendations =
      await openaiService.generateRecommendationsWithExplanations(
        query,
        similarBooks
      );

    return NextResponse.json({
      recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
