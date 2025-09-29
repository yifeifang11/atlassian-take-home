"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ReadingChallengeProps {
  booksRead?: number;
}

export function ReadingChallenge({ booksRead = 0 }: ReadingChallengeProps) {
  const [readingGoal, setReadingGoal] = useState(24); // Default goal
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadReadingGoal = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const preferences = await response.json();
          setReadingGoal(preferences.readingGoal || 24);
        } else {
          console.error("Failed to load reading goal:", response.status);
        }
      } catch (error) {
        console.error("Failed to load reading goal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReadingGoal();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 font-sans uppercase">
          READING CHALLENGE
        </h2>
        <div className="text-center">
          <div className="bg-teal-600 text-white p-4 mb-4">
            <div className="text-4xl font-bold">2025</div>
            <div className="text-sm">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const progress =
    readingGoal > 0 ? Math.round((booksRead / readingGoal) * 100) : 0;
  const remaining = Math.max(0, readingGoal - booksRead);

  // Calculate if ahead or behind schedule (assuming even distribution throughout the year)
  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor(
      (currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  const expectedProgress = Math.floor((dayOfYear / 365) * readingGoal);
  const scheduleStatus = booksRead - expectedProgress;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 font-sans uppercase">
        READING CHALLENGE
      </h2>
      <div className="text-center">
        <div className="bg-teal-600 text-white p-4 mb-4">
          <div className="text-4xl font-bold">2025</div>
          <div className="text-sm">
            {booksRead} book{booksRead !== 1 ? "s" : ""} completed
          </div>
          {scheduleStatus > 0 ? (
            <div className="text-sm text-green-200">
              {scheduleStatus} book{scheduleStatus !== 1 ? "s" : ""} ahead of
              schedule
            </div>
          ) : scheduleStatus < 0 ? (
            <div className="text-sm text-orange-200">
              {Math.abs(scheduleStatus)} book
              {Math.abs(scheduleStatus) !== 1 ? "s" : ""} behind schedule
            </div>
          ) : (
            <div className="text-sm text-green-200">Right on schedule!</div>
          )}
          <div className="text-xs">
            {booksRead}/{readingGoal} ({progress}%)
          </div>
          {remaining > 0 && (
            <div className="text-xs mt-1">
              {remaining} book{remaining !== 1 ? "s" : ""} to go
            </div>
          )}
        </div>
        <div className="text-xs font-medium text-teal-600 mb-2">
          READING CHALLENGE
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={() => router.push("/profile")}
        >
          View Challenge
        </Button>
      </div>
    </div>
  );
}
