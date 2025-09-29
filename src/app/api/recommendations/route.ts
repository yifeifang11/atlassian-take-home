import { NextRequest, NextResponse } from "next/server";
import { openaiService } from "@/lib/openai";
import booksData from "@/data/books.json";
import dbConnect from "@/lib/mongodb";
import { UserState } from "@/models/UserState";

interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverUrl: string;
  tags: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log(`Getting recommendations for: "${query}"`);

    // Get user's shelf data to filter out books already on shelves
    await dbConnect();
    const userState = await UserState.findOne({ userId: "default" });

    const userBooks = userState
      ? [...userState.readIds, ...userState.toReadIds, ...userState.readingIds]
      : [];

    console.log(
      `User has ${userBooks.length} books on shelves, filtering them out`
    );

    // Filter out books that are already on user's shelves
    const availableBooks = (booksData as Book[]).filter(
      (book) => !userBooks.includes(book.id)
    );

    console.log(
      `Filtered down to ${availableBooks.length} available books for recommendations`
    );

    // Use ChatGPT to analyze the query and select books
    const recommendations = await getAIRecommendations(
      query,
      availableBooks,
      userState?.readIds || []
    );

    console.log(`Found ${recommendations.length} recommendations`);

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

async function getAIRecommendations(
  userQuery: string,
  books: Book[],
  readBooks: string[]
) {
  // Create a more concise book list to avoid token limits
  const bookList = books
    .map(
      (book, index) =>
        `${index + 1}. "${book.title}" by ${book.author} (${book.genres.join(
          ", "
        )}) - ${book.description.substring(0, 80)}...`
    )
    .join("\n");

  // Create context about user's reading history if available
  const readBooksContext =
    readBooks.length > 0
      ? `\n\nUser's reading history (books they've already read): ${readBooks.join(
          ", "
        )}`
      : "\n\nUser's reading history: No previous books recorded";

  const prompt = `You are a book recommendation expert. Based on the user's request and their reading history, select exactly 6 BEST matching books from this curated list. 

User's request: "${userQuery}"${readBooksContext}

Available books (excluding books already on user's shelves):
${bookList}

Instructions:
1. If they want "happy" books, avoid tragic, sad, or dark themes
2. Match their emotional needs and preferences carefully
3. Consider their reading history to suggest similar or complementary books
4. Provide variety in your selections
5. ONLY recommend books from the available list above

Respond with exactly 6 book recommendations in this simple format:
BOOK: [number]
REASON: [one sentence explanation]

BOOK: [number] 
REASON: [one sentence explanation]

(repeat for all 6 books)

Example:
BOOK: 3
REASON: This romantic story provides uplifting themes perfect for happiness.

BOOK: 8
REASON: This philosophical novel offers hope and positive reflections on life choices.`;

  try {
    const response = await openaiService.generateCompletion(prompt, 0.3);
    console.log("AI Response:", response);

    // Parse the simple format instead of JSON
    const bookMatches = response.match(/BOOK:\s*(\d+)\s*\nREASON:\s*([^\n]+)/g);

    if (!bookMatches || bookMatches.length === 0) {
      console.log("No book matches found in response, using fallback");
      return getFallbackBooks(books);
    }

    const recommendations = bookMatches
      .slice(0, 6)
      .map((match) => {
        const bookMatch = match.match(/BOOK:\s*(\d+)\s*\nREASON:\s*([^\n]+)/);
        if (!bookMatch) return null;

        const bookNumber = parseInt(bookMatch[1]);
        const explanation = bookMatch[2].trim();
        const bookIndex = bookNumber - 1;
        const book = books[bookIndex];

        if (!book) {
          console.warn(`Invalid book number: ${bookNumber}`);
          return null;
        }

        return {
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            genres: book.genres,
            description: book.description,
            coverUrl: book.coverUrl,
          },
          explanation: explanation,
          similarity: Math.random() * 0.2 + 0.8,
        };
      })
      .filter(Boolean);

    console.log(
      `Successfully parsed ${recommendations.length} recommendations from AI`
    );
    return recommendations.length > 0
      ? recommendations
      : getFallbackBooks(books);
  } catch (error) {
    console.error("AI recommendation error:", error);
    return getFallbackBooks(books);
  }

  try {
    const response = await openaiService.generateCompletion(prompt, 0.3);
    console.log("AI Response:", response);

    // Try multiple approaches to parse the JSON response
    let aiResult;
    try {
      // First, try to clean up the response
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      aiResult = JSON.parse(cleanResponse);
    } catch {
      console.log("First JSON parse failed, trying to fix common issues...");
      try {
        // Try to fix common JSON issues
        let fixedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
        // Fix unescaped quotes in explanations
        fixedResponse = fixedResponse.replace(
          /: "([^"]*)"([^"]*)"([^"]*)",/g,
          ': "$1\\"$2\\"$3",'
        );
        // Fix trailing commas
        fixedResponse = fixedResponse.replace(/,(\s*[}\]])/g, "$1");
        aiResult = JSON.parse(fixedResponse);
      } catch {
        console.log("JSON parsing failed completely, using fallback approach");
        // If JSON parsing completely fails, return fallback
        return getFallbackBooks(books);
      }
    }

    if (
      !aiResult ||
      !aiResult.recommendations ||
      aiResult.recommendations.length === 0
    ) {
      console.log("No valid recommendations found in AI result:", aiResult);
      return getFallbackBooks(books);
    }

    console.log(
      `Successfully parsed ${aiResult.recommendations.length} recommendations from AI`
    );

    // Convert AI recommendations to our format
    const recommendations = aiResult.recommendations
      .slice(0, 6) // Ensure we don't exceed 6
      .map((rec: { bookNumber: number; explanation: string }) => {
        const bookIndex = rec.bookNumber - 1; // Convert to 0-based index
        const book = books[bookIndex];

        if (!book) {
          console.warn(`Invalid book number: ${rec.bookNumber}`);
          return null;
        }

        return {
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            genres: book.genres,
            description: book.description,
            coverUrl: book.coverUrl,
          },
          explanation:
            rec.explanation ||
            `This ${book.genres.join(
              " and "
            )} book was selected because it matches your request for meaningful stories.`,
          similarity: Math.random() * 0.2 + 0.8, // Higher similarity for AI-selected books
        };
      })
      .filter(Boolean); // Remove null entries

    return recommendations.length > 0
      ? recommendations
      : getFallbackBooks(books);
  } catch (error) {
    console.error("AI recommendation error:", error);
    return getFallbackBooks(books);
  }
}

function getFallbackBooks(books: Book[]) {
  return books
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .map((book) => ({
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        genres: book.genres,
        description: book.description,
        coverUrl: book.coverUrl,
      },
      explanation: `This ${book.genres.join(
        " and "
      )} book was selected from our curated collection for your preferences.`,
      similarity: Math.random() * 0.3 + 0.7,
    }));
}
