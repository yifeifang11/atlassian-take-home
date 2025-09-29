"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  bookId: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export function StarRating({
  bookId,
  initialRating = 0,
  onRatingChange,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  // Update rating when initialRating changes
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleStarClick = async (starRating: number) => {
    if (readonly) return;

    try {
      // Save rating to API
      const response = await fetch("/api/user/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          rating: starRating,
        }),
      });

      if (response.ok) {
        setRating(starRating);
        onRatingChange?.(starRating);
        
        // Show success feedback
        console.log(`Successfully rated book ${bookId} with ${starRating} stars`);
      } else {
        console.error("Failed to save rating");
        alert("Failed to save rating. Please try again.");
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      alert("Error saving rating. Please try again.");
    }
  };

  const handleStarHover = (starRating: number) => {
    if (readonly) return;
    setHoverRating(starRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } transition-transform duration-150`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={readonly}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors duration-150 ${
                star <= displayRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300 hover:text-amber-300"
              }`}
            />
          </button>
        ))}
      </div>
      {!readonly && (
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? `${rating}/5` : "Rate this book"}
        </span>
      )}
    </div>
  );
}