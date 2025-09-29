export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  subject?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  language?: string[];
  edition_count?: number;
}

export interface OpenLibraryWork {
  title: string;
  description?: string | { type: string; value: string };
  authors?: Array<{ author: { key: string } }>;
  subjects?: string[];
  covers?: number[];
  first_publish_date?: string;
}

export interface BookData {
  id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverUrl?: string;
  openLibraryId: string;
}

export class OpenLibraryService {
  private baseUrl = "https://openlibrary.org";
  private coversUrl = "https://covers.openlibrary.org";
  private lastRequestTime = 0;
  private minRequestInterval = 100; // 100ms between requests

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  async searchBooks(
    query: string,
    limit: number = 30
  ): Promise<OpenLibraryBook[]> {
    try {
      // Search with sorting by popularity/edition count to get more popular books
      const response = await fetch(
        `${this.baseUrl}/search.json?q=${encodeURIComponent(
          query
        )}&limit=${limit}&sort=edition_count`
      );

      if (!response.ok) {
        throw new Error(`Open Library search failed: ${response.statusText}`);
      }

      const data = await response.json();
      const books = data.docs || [];

      // Filter and sort books by quality indicators
      return books
        .filter((book: OpenLibraryBook) => {
          // Only include books with covers and reasonable metadata
          return (
            book.cover_i &&
            book.title &&
            book.author_name &&
            book.author_name.length > 0 &&
            book.edition_count &&
            book.edition_count > 1
          ); // Multiple editions = popular
        })
        .sort((a: OpenLibraryBook, b: OpenLibraryBook) => {
          // Sort by edition count (popularity indicator)
          return (b.edition_count || 0) - (a.edition_count || 0);
        });
    } catch (error) {
      console.error("Error searching Open Library:", error);
      throw error;
    }
  }

  async getWorkDetails(workKey: string): Promise<OpenLibraryWork> {
    await this.throttleRequest();

    try {
      const response = await fetch(`${this.baseUrl}${workKey}.json`);

      if (!response.ok) {
        throw new Error(
          `Open Library work fetch failed: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching work details:", error);
      throw error;
    }
  }

  getCoverUrl(coverId: number, size: "S" | "M" | "L" = "L"): string {
    return `${this.coversUrl}/b/id/${coverId}-${size}.jpg`;
  }

  private extractDescription(description: unknown): string {
    if (!description) return "";

    if (typeof description === "string") {
      return description;
    }

    if (
      typeof description === "object" &&
      description !== null &&
      "value" in description
    ) {
      const desc = description as { value: string };
      return desc.value;
    }

    return "";
  }

  async convertToBookData(
    searchResult: OpenLibraryBook
  ): Promise<BookData | null> {
    try {
      const bookId = searchResult.key.replace("/works/", "");

      // Get work details for better description
      let workDetails: OpenLibraryWork | null = null;
      try {
        workDetails = await this.getWorkDetails(searchResult.key);
      } catch (error) {
        console.warn(
          `Could not fetch work details for ${searchResult.key}:`,
          error
        );
      }

      const title = searchResult.title || workDetails?.title || "Unknown Title";
      const author = searchResult.author_name?.[0] || "Unknown Author";
      const genres =
        searchResult.subject?.slice(0, 5) ||
        workDetails?.subjects?.slice(0, 5) ||
        [];
      const description = workDetails
        ? this.extractDescription(workDetails.description)
        : `A book by ${author}`;

      const coverUrl = searchResult.cover_i
        ? this.getCoverUrl(searchResult.cover_i)
        : undefined;

      return {
        id: bookId,
        title,
        author,
        genres,
        description: description || `A book titled "${title}" by ${author}`,
        coverUrl,
        openLibraryId: searchResult.key,
      };
    } catch (error) {
      console.error("Error converting search result to book data:", error);
      return null;
    }
  }

  async searchAndConvert(
    query: string,
    limit: number = 20
  ): Promise<BookData[]> {
    try {
      const searchResults = await this.searchBooks(query, limit);
      const bookDataResults: BookData[] = [];

      // Process books sequentially to avoid rate limiting
      for (const result of searchResults) {
        try {
          const bookData = await this.convertToBookData(result);
          if (bookData) {
            bookDataResults.push(bookData);
          }
        } catch (error) {
          console.warn(`Failed to convert book ${result.key}:`, error);
          // Continue with other books even if one fails
        }
      }

      return bookDataResults;
    } catch (error) {
      console.error("Error in searchAndConvert:", error);
      return [];
    }
  }
}

export const openLibraryService = new OpenLibraryService();
