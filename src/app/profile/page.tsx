"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  BookOpen,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";

interface UserStats {
  read: number;
  toRead: number;
  reading: number;
  favorites: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverUrl?: string;
}

interface ShelfBooks {
  [key: string]: Book[];
}

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats>({
    read: 0,
    toRead: 0,
    reading: 0,
    favorites: 0,
  });
  const [shelfBooks, setShelfBooks] = useState<ShelfBooks>({});
  const [expandedShelves, setExpandedShelves] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [loadingShelf, setLoadingShelf] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch("/api/user/books");
        if (response.ok) {
          const data = await response.json();
          setStats({
            read: data.read.length,
            toRead: data.toRead.length,
            reading: data.reading.length,
            favorites: data.favorites.length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const fetchShelfBooks = async (shelf: string) => {
    if (shelfBooks[shelf] || loadingShelf === shelf) return;

    setLoadingShelf(shelf);
    try {
      const response = await fetch(`/api/books?shelf=${shelf}`);
      if (response.ok) {
        const data = await response.json();
        setShelfBooks((prev) => ({ ...prev, [shelf]: data.books }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${shelf} books:`, error);
    } finally {
      setLoadingShelf(null);
    }
  };

  const toggleShelf = async (shelf: string) => {
    const isExpanded = expandedShelves[shelf];
    setExpandedShelves((prev) => ({ ...prev, [shelf]: !isExpanded }));

    if (!isExpanded && !shelfBooks[shelf]) {
      await fetchShelfBooks(shelf);
    }
  };

  const BookCard = ({ book }: { book: Book }) => (
    <Card className="flex overflow-hidden">
      <div className="w-20 h-28 relative bg-gray-100 flex-shrink-0">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <BookOpen className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="flex-1 p-3">
        <h4 className="font-semibold text-sm mb-1 line-clamp-2">
          {book.title}
        </h4>
        <p className="text-gray-600 text-xs mb-2">by {book.author}</p>
        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {book.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
        <p className="text-gray-600 text-xs line-clamp-2">{book.description}</p>
      </div>
    </Card>
  );

  const ShelfCard = ({
    title,
    description,
    count,
    icon: Icon,
    color,
    shelf,
  }: {
    title: string;
    description: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    shelf: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            {title}
          </div>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleShelf(shelf)}
              className="h-8 w-8 p-0"
            >
              {expandedShelves[shelf] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <div className={`text-3xl font-bold ${color} mb-2`}>{count}</div>
          <p className="text-gray-600 text-sm">
            {count === 0
              ? "No books yet"
              : `${count} book${count > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Expandable books list */}
        {expandedShelves[shelf] && (
          <div className="border-t pt-4 mt-4">
            {loadingShelf === shelf ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading books...</p>
              </div>
            ) : shelfBooks[shelf]?.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {shelfBooks[shelf].map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No books in this shelf
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Reading Profile & Library
        </h1>
        <p className="text-gray-600">
          Track your reading journey and explore your personal book collection
        </p>
      </div>

      {/* My Bookshelves */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ShelfCard
          title="Currently Reading"
          description="Books you're reading right now"
          count={stats.reading}
          icon={Target}
          color="text-blue-600"
          shelf="reading"
        />
        <ShelfCard
          title="Want to Read"
          description="Your reading wishlist"
          count={stats.toRead}
          icon={BookOpen}
          color="text-amber-600"
          shelf="toRead"
        />
        <ShelfCard
          title="Read"
          description="Books you've completed"
          count={stats.read}
          icon={Award}
          color="text-green-600"
          shelf="read"
        />
      </div>

      {/* Reading Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reading Progress</CardTitle>
            <CardDescription>Your reading activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Books Completed</span>
                  <span>{stats.read}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (stats.read / (stats.read + stats.toRead + 1)) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Reading List Progress</span>
                  <span>{stats.reading} in progress</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (stats.reading / Math.max(stats.reading, 1)) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Discover your next favorite book</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Get personalized book recommendations powered by AI based on
                your reading preferences.
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                Get Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message for New Users */}
      {stats.read === 0 && stats.toRead === 0 && stats.reading === 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Welcome to AI Goodreads!</CardTitle>
            <CardDescription>
              Start your personalized reading journey
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-6">
              Welcome! Start by getting AI-powered book recommendations tailored
              to your taste, then build your personal library as you discover
              new favorites.
            </p>
            <div className="space-x-4">
              <Button onClick={() => (window.location.href = "/")}>
                Get Started
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/recommendations")}
              >
                Browse Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
