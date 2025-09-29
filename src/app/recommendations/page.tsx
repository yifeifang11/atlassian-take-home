"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Plus, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";

interface BookRecommendation {
  book: {
    id: string;
    title: string;
    author: string;
    genres: string[];
    description: string;
    coverUrl?: string;
  };
  explanation: string;
  similarity?: number;
}

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [recommendations, setRecommendations] = useState<BookRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
  const [userShelves, setUserShelves] = useState<{
    read: string[];
    toRead: string[];
    reading: string[];
  }>({ read: [], toRead: [], reading: [] });

  const fetchUserShelves = async () => {
    try {
      const response = await fetch("/api/user/books");
      if (response.ok) {
        const data = await response.json();
        setUserShelves(data);
      }
    } catch (error) {
      console.error("Failed to fetch user shelves:", error);
    }
  };

  const getBookShelfStatus = (bookId: string) => {
    if (userShelves.read.includes(bookId)) return "read";
    if (userShelves.toRead.includes(bookId)) return "toRead";
    if (userShelves.reading.includes(bookId)) return "reading";
    return null;
  };

  const fetchRecommendations = async (userQuery: string) => {
    if (!userQuery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (bookId: string, action: "like" | "dislike") => {
    setFeedbackLoading(bookId);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId, action, query }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      // Refresh recommendations after feedback
      await fetchRecommendations(query);
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setFeedbackLoading(null);
    }
  };

  const handleAddToShelf = async (
    bookId: string,
    shelf: "read" | "toRead" | "reading"
  ) => {
    try {
      const response = await fetch("/api/user/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId, shelf }),
      });

      if (!response.ok) {
        throw new Error("Failed to add book to shelf");
      }

      // Refresh user shelves data
      await fetchUserShelves();

      // Show success message or update UI
      alert("Book added to shelf!");
    } catch (err) {
      console.error("Add to shelf error:", err);
      alert("Failed to add book to shelf");
    }
  };

  useEffect(() => {
    fetchUserShelves();
  }, []);

  useEffect(() => {
    if (query) {
      fetchRecommendations(query);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Finding perfect books for you...
          </h2>
          <p className="text-gray-600">
            This may take a moment as we analyze thousands of books.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchRecommendations(query)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Recommendations for: &ldquo;{query}&rdquo;
        </h1>
        <p className="text-gray-600">
          Found {recommendations.length} books that match your taste
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            No recommendations found for your query. Try different keywords or
            themes.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Try Another Search
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {recommendations.map((rec) => (
            <Card key={rec.book.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Book Cover */}
                <div className="md:w-48 h-64 md:h-auto relative bg-gray-100">
                  {rec.book.coverUrl ? (
                    <Image
                      src={rec.book.coverUrl}
                      alt={rec.book.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-sm">No cover available</span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {rec.book.title}
                      </h3>
                      <p className="text-gray-700 mb-2">by {rec.book.author}</p>

                      {rec.book.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {rec.book.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {rec.book.description}
                      </p>

                      {/* AI Explanation */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Why we recommend this:
                        </h4>
                        <p className="text-blue-800 text-sm">
                          {rec.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {(() => {
                        const shelfStatus = getBookShelfStatus(rec.book.id);

                        if (shelfStatus === "read") {
                          return (
                            <Button
                              variant="outline"
                              className="flex-1"
                              disabled
                            >
                              ✓ Already Read
                            </Button>
                          );
                        } else if (shelfStatus === "reading") {
                          return (
                            <Button
                              variant="outline"
                              className="flex-1"
                              disabled
                            >
                              📖 Currently Reading
                            </Button>
                          );
                        } else if (shelfStatus === "toRead") {
                          return (
                            <Button
                              variant="outline"
                              className="flex-1"
                              disabled
                            >
                              📚 Want to Read
                            </Button>
                          );
                        } else {
                          return (
                            <Button
                              onClick={() =>
                                handleAddToShelf(rec.book.id, "toRead")
                              }
                              className="flex-1"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to To Read
                            </Button>
                          );
                        }
                      })()}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(rec.book.id, "like")}
                          disabled={feedbackLoading === rec.book.id}
                          className="flex-1 sm:flex-none"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Like these
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(rec.book.id, "dislike")}
                          disabled={feedbackLoading === rec.book.id}
                          className="flex-1 sm:flex-none"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Not for me
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="text-center mt-8">
          <Button
            onClick={() => fetchRecommendations(query)}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Get More Recommendations
          </Button>
        </div>
      )}
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading recommendations...</div>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
