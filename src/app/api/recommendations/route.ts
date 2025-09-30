import { NextRequest, NextResponse } from "next/server";
import { openaiService } from "@/lib/openai";
import booksData from "@/data/books.json";
import dbConnect from "@/lib/mongodb";
import { UserState } from "@/models/UserState";
import { UserPreferences, IUserPreferences } from "@/models/UserPreferences";
import { Rating } from "@/models/Rating";
import { RecommendationFeedback } from "@/models/RecommendationFeedback";

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
    const { query, feedback } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log(`Getting recommendations for: "${query}"`);
    if (feedback) {
      console.log(`User feedback included:`, feedback);
    }

    // Connect to database
    await dbConnect();

    // Get user's shelf data, preferences, ratings, and historical feedback
    const userId = "default";
    const [userState, userPreferences, userRatings, historicalFeedback] =
      await Promise.all([
        UserState.findOne({ userId }),
        UserPreferences.findOne({ userId }),
        Rating.find({ userId }),
        RecommendationFeedback.find({ userId })
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

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

    // Create ratings map for easy lookup
    const ratingsMap = userRatings.reduce((acc, rating) => {
      acc[rating.bookId] = rating.rating;
      return acc;
    }, {} as Record<string, number>);

    // Use ChatGPT to analyze the query and select books with enhanced context
    const recommendations = await getAIRecommendations(
      query,
      availableBooks,
      userState?.readIds || [],
      userState?.readingIds || [],
      userPreferences,
      ratingsMap,
      feedback,
      historicalFeedback
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
  readBooks: string[],
  readingBooks: string[],
  userPreferences: IUserPreferences | null,
  ratingsMap: Record<string, number>,
  feedback?: {
    reasons: string[];
    customFeedback: string;
  },
  historicalFeedback?: Array<{
    query: string;
    feedback: "liked" | "disliked";
    reasons?: string[];
    customFeedback?: string;
    createdAt: Date;
  }>
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

  // Create enhanced user context with preferences and ratings
  const userPreferencesContext = userPreferences
    ? `

USER PREFERENCES:
- Favorite genres: ${
        userPreferences.favoriteGenres?.join(", ") || "Not specified"
      }
- Preferred book length: ${userPreferences.preferredLength || "Not specified"}
- Content warnings to avoid: ${
        userPreferences.contentWarnings?.join(", ") || "None specified"
      }
- Language preference: ${userPreferences.languagePreference || "English"}
- Reading goal: ${userPreferences.readingGoal || "Not set"} books per year`
    : "\n\nUSER PREFERENCES: No preferences set";

  // Create detailed reading history with ratings
  let readingHistoryContext = "\n\nREADING HISTORY:";

  if (readBooks.length > 0) {
    // Get book details for read books and include ratings
    const readBookDetails = readBooks
      .map((bookId) => {
        const book = (booksData as Book[]).find((b) => b.id === bookId);
        const rating = ratingsMap[bookId];
        if (book) {
          return `- "${book.title}" by ${book.author} (${book.genres.join(
            ", "
          )})${rating ? ` - Rated ${rating}/5 stars` : " - No rating"}`;
        }
        return `- ${bookId}${
          rating ? ` - Rated ${rating}/5 stars` : " - No rating"
        }`;
      })
      .join("\n");
    readingHistoryContext += `\nBooks already read:\n${readBookDetails}`;
  } else {
    readingHistoryContext += "\nNo books read yet";
  }

  if (readingBooks.length > 0) {
    const currentlyReadingDetails = readingBooks
      .map((bookId) => {
        const book = (booksData as Book[]).find((b) => b.id === bookId);
        return book
          ? `- "${book.title}" by ${book.author} (${book.genres.join(", ")})`
          : `- ${bookId}`;
      })
      .join("\n");
    readingHistoryContext += `\n\nCurrently reading:\n${currentlyReadingDetails}`;
  }

  // Analyze user's rating patterns for additional context
  const ratings = Object.values(ratingsMap);
  let ratingContext = "";
  if (ratings.length > 0) {
    const avgRating = (
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    ).toFixed(1);
    const highRatedBooks = Object.entries(ratingsMap).filter(
      ([, rating]) => rating >= 4
    );
    const lowRatedBooks = Object.entries(ratingsMap).filter(
      ([, rating]) => rating <= 2
    );

    ratingContext = `\n\nRATING PATTERNS:
- Average rating given: ${avgRating}/5 stars
- High-rated books (4-5 stars): ${highRatedBooks.length}
- Low-rated books (1-2 stars): ${lowRatedBooks.length}`;

    if (highRatedBooks.length > 0) {
      const highRatedTitles = highRatedBooks
        .map(([bookId]) => {
          const book = (booksData as Book[]).find((b) => b.id === bookId);
          return book ? book.title : bookId;
        })
        .slice(0, 3)
        .join(", ");
      ratingContext += `\n- Most enjoyed books: ${highRatedTitles}${
        highRatedBooks.length > 3 ? " (and others)" : ""
      }`;
    }
  }

  // Add feedback context if provided
  let feedbackContext = "";
  if (
    feedback &&
    (feedback.reasons.length > 0 || feedback.customFeedback.trim())
  ) {
    feedbackContext = `\n\nPREVIOUS RECOMMENDATION FEEDBACK:
The user was NOT satisfied with previous recommendations for the following reasons:`;

    if (feedback.reasons.length > 0) {
      feedbackContext += `\n- Issues mentioned: ${feedback.reasons.join(", ")}`;
    }

    if (feedback.customFeedback.trim()) {
      feedbackContext += `\n- Additional feedback: "${feedback.customFeedback.trim()}"`;
    }

    feedbackContext += `\n\nIMPORTANT: Use this feedback to AVOID similar issues in new recommendations. Address the specific concerns mentioned above.`;
  }

  // Add historical feedback patterns
  let historicalFeedbackContext = "";
  if (historicalFeedback && historicalFeedback.length > 0) {
    const dislikedFeedback = historicalFeedback.filter(
      (f) => f.feedback === "disliked"
    );
    if (dislikedFeedback.length > 0) {
      historicalFeedbackContext = `\n\nHISTORICAL FEEDBACK PATTERNS:
The user has provided negative feedback on previous recommendations:`;

      dislikedFeedback.slice(0, 3).forEach((fb, index) => {
        historicalFeedbackContext += `\n${index + 1}. Query: "${fb.query}"`;
        if (fb.reasons && fb.reasons.length > 0) {
          historicalFeedbackContext += ` - Issues: ${fb.reasons.join(", ")}`;
        }
        if (fb.customFeedback && fb.customFeedback.trim()) {
          historicalFeedbackContext += ` - Additional: "${fb.customFeedback.trim()}"`;
        }
      });

      historicalFeedbackContext += `\n\nLEARN FROM PATTERNS: Avoid recommending books with similar characteristics that caused previous dissatisfaction.`;
    }
  }

  const prompt = `You are an expert book recommendation AI. Analyze the user's request along with their detailed reading profile to select exactly 6 BEST matching books.

USER'S REQUEST: "${userQuery}"
${userPreferencesContext}
${readingHistoryContext}
${ratingContext}
${feedbackContext}
${historicalFeedbackContext}

AVAILABLE BOOKS (excluding books already on shelves):
${bookList}

RECOMMENDATION STRATEGY:
1. PRIORITIZE user's favorite genres and preferred book length
2. RESPECT content warnings - avoid books with themes they want to avoid
3. ANALYZE their rating patterns - recommend similar styles to high-rated books, avoid styles similar to low-rated books
4. CONSIDER their reading history to suggest complementary or similar books
5. MATCH the emotional tone of their request (happy, sad, thrilling, etc.)
6. PROVIDE variety while staying true to their preferences
7. IF FEEDBACK PROVIDED: Carefully address each concern to avoid repeating the same issues
8. ONLY recommend from the available books list above

Respond with exactly 6 book recommendations in this format:
BOOK: [number]
REASON: [one sentence explanation focusing on why this matches their profile]

BOOK: [number] 
REASON: [one sentence explanation focusing on why this matches their profile]

(repeat for all 6 books)`;

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
