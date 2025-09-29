import { NextRequest, NextResponse } from "next/server";
import booksData from "@/data/books.json";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  genres: string[];
  tags?: string[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ books: [] });
    }

    const searchTerm = query.toLowerCase().trim();

    // Fuzzy search function
    const fuzzyMatch = (text: string, searchTerm: string): number => {
      const textLower = text.toLowerCase();

      // Exact match gets highest score
      if (textLower.includes(searchTerm)) {
        return textLower === searchTerm ? 100 : 90;
      }

      // Check for partial matches and word boundaries
      const words = searchTerm.split(" ");
      let score = 0;

      for (const word of words) {
        if (textLower.includes(word)) {
          score += 30;
        }
      }

      // Character similarity for typos
      if (score === 0) {
        score = calculateSimilarity(textLower, searchTerm);
      }

      return score;
    };

    // Simple character similarity function for typos
    const calculateSimilarity = (str1: string, str2: string): number => {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;

      if (longer.length === 0) return 100;

      const editDistance = levenshteinDistance(longer, shorter);
      const similarity = ((longer.length - editDistance) / longer.length) * 100;

      return similarity > 60 ? similarity * 0.5 : 0; // Reduce weight for similarity matches
    };

    // Levenshtein distance for character similarity
    const levenshteinDistance = (str1: string, str2: string): number => {
      const matrix = [];

      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }

      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      return matrix[str2.length][str1.length];
    };

    // Search through books
    const searchResults = (booksData as Book[])
      .map((book) => {
        const titleScore = fuzzyMatch(book.title, searchTerm);
        const authorScore = fuzzyMatch(book.author, searchTerm);
        const genreScore = book.genres.reduce(
          (max, genre) => Math.max(max, fuzzyMatch(genre, searchTerm)),
          0
        );

        // Calculate total score with weights
        const totalScore =
          titleScore * 2 + authorScore * 1.5 + genreScore * 0.5;

        return {
          book,
          score: totalScore,
        };
      })
      .filter((result) => result.score > 15) // Filter out low-relevance results
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, 10) // Limit to top 10 results
      .map((result) => result.book);

    return NextResponse.json({
      books: searchResults,
      total: searchResults.length,
      query: query,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search books", books: [] },
      { status: 500 }
    );
  }
}
