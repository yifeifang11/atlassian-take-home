"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

  // Overall feedback state
  const [overallFeedback, setOverallFeedback] = useState<
    "liked" | "disliked" | null
  >(null);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [feedbackReasons, setFeedbackReasons] = useState<string[]>([]);
  const [customFeedback, setCustomFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  const fetchRecommendations = async (
    userQuery: string,
    feedback?: {
      reasons: string[];
      customFeedback: string;
    }
  ) => {
    if (!userQuery) return;

    setLoading(true);
    setError(null);

    try {
      const requestBody: {
        query: string;
        feedback?: {
          reasons: string[];
          customFeedback: string;
        };
      } = { query: userQuery };

      if (feedback) {
        requestBody.feedback = feedback;
      }

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);

      // Reset feedback state when getting new recommendations
      setOverallFeedback(null);
      setShowDetailedFeedback(false);
      setFeedbackReasons([]);
      setCustomFeedback("");
      setFeedbackSubmitted(false);
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

  const submitOverallFeedback = async () => {
    try {
      const response = await fetch("/api/recommendation-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          feedback: overallFeedback,
          reasons: feedbackReasons,
          customFeedback,
          recommendedBooks: recommendations.map((rec) => rec.book.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Submit feedback error:", err);
      alert("Failed to submit feedback");
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            Finding perfect books for you...
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            This may take a moment as we analyze thousands of books.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-red-600">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <Button
            onClick={() => fetchRecommendations(query)}
            variant="outline"
            className="text-[#01635d] border-[#01635d] hover:bg-[#01635d] hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">
          AI Book Recommendations
        </h1>
        <p className="text-gray-600">
          Get personalized book recommendations based on your reading
          preferences, history, and ratings.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            No recommendations found for your query. Try different keywords or
            themes.
          </p>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="text-[#01635d] border-[#01635d] hover:bg-[#01635d] hover:text-white"
          >
            Try Another Search
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div
              key={rec.book.id}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Book Cover */}
              <div className="flex-shrink-0 self-center sm:self-start">
                {rec.book.coverUrl ? (
                  <Image
                    src={rec.book.coverUrl}
                    alt={rec.book.title}
                    width={80}
                    height={120}
                    className="object-cover rounded sm:w-[100px] sm:h-[150px]"
                  />
                ) : (
                  <div className="w-[80px] h-[120px] sm:w-[100px] sm:h-[150px] bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500 text-center px-2">
                      No Cover
                    </span>
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-[#01635d] mb-1 hover:underline cursor-pointer">
                    {rec.book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    by {rec.book.author}
                  </p>

                  {rec.book.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {rec.book.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    {rec.book.description}
                  </p>

                  {/* AI Explanation */}
                  <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded mb-4">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm">
                      Why we recommend this:
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {rec.explanation}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    {(() => {
                      const shelfStatus = getBookShelfStatus(rec.book.id);

                      if (shelfStatus === "read") {
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="text-xs w-full sm:w-auto"
                          >
                            ✓ Already Read
                          </Button>
                        );
                      } else if (shelfStatus === "reading") {
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="text-xs w-full sm:w-auto"
                          >
                            📖 Currently Reading
                          </Button>
                        );
                      } else if (shelfStatus === "toRead") {
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="text-xs w-full sm:w-auto"
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
                            size="sm"
                            className="text-xs bg-[#01635d] hover:bg-[#014a40] text-white w-full sm:w-auto"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to To Read
                          </Button>
                        );
                      }
                    })()}

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(rec.book.id, "like")}
                        disabled={feedbackLoading === rec.book.id}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Like</span>
                        <span className="sm:hidden">👍</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(rec.book.id, "dislike")}
                        disabled={feedbackLoading === rec.book.id}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Pass</span>
                        <span className="sm:hidden">👎</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Feedback Section */}
      {recommendations.length > 0 && !feedbackSubmitted && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How were these recommendations?
          </h3>

          {overallFeedback === null ? (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setOverallFeedback("liked")}
                variant="outline"
                className="flex items-center gap-2 text-[#01635d] border-[#01635d] hover:bg-[#01635d] hover:text-white"
              >
                <ThumbsUp className="h-4 w-4" />I liked them
              </Button>
              <Button
                onClick={() => {
                  setOverallFeedback("disliked");
                  setShowDetailedFeedback(true);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ThumbsDown className="h-4 w-4" />
                Not quite right
              </Button>
            </div>
          ) : overallFeedback === "liked" ? (
            <div className="text-center">
              <p className="text-green-700 mb-4">
                Thanks for the feedback! We'll keep improving your
                recommendations.
              </p>
              <Button
                onClick={submitOverallFeedback}
                className="bg-[#01635d] hover:bg-[#014a40] text-white"
              >
                Done
              </Button>
            </div>
          ) : (
            showDetailedFeedback && (
              <div className="space-y-4">
                <p className="text-gray-700 mb-4">
                  Help us understand what you didn't like so we can improve
                  future recommendations:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Books too difficult/advanced",
                    "Books too easy/simple",
                    "Wrong genres",
                    "Already read similar books",
                    "Not interested in these topics",
                    "Books too long/short",
                    "Authors I don't like",
                    "Content not appropriate",
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => {
                        if (feedbackReasons.includes(reason)) {
                          setFeedbackReasons(
                            feedbackReasons.filter((r) => r !== reason)
                          );
                        } else {
                          setFeedbackReasons([...feedbackReasons, reason]);
                        }
                      }}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                        feedbackReasons.includes(reason)
                          ? "bg-red-100 border-red-300 text-red-800"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional feedback (optional):
                  </label>
                  <Textarea
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    placeholder="Tell us more about what you'd like to see..."
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setShowDetailedFeedback(false);
                      setOverallFeedback(null);
                      setFeedbackReasons([]);
                      setCustomFeedback("");
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitOverallFeedback}
                    className="bg-[#01635d] hover:bg-[#014a40] text-white"
                    disabled={
                      feedbackReasons.length === 0 &&
                      customFeedback.trim() === ""
                    }
                  >
                    Submit Feedback
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="text-center mt-8">
          <Button
            onClick={() => {
              const feedback =
                (feedbackSubmitted && feedbackReasons.length > 0) ||
                customFeedback.trim() !== ""
                  ? { reasons: feedbackReasons, customFeedback: customFeedback }
                  : undefined;
              fetchRecommendations(query, feedback);
            }}
            variant="outline"
            disabled={loading}
            className="text-[#01635d] border-[#01635d] hover:bg-[#01635d] hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {feedbackSubmitted &&
            (feedbackReasons.length > 0 || customFeedback.trim() !== "")
              ? "Get Better Recommendations"
              : "Get More Recommendations"}
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">Loading recommendations...</div>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
