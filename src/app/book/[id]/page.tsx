"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  BookOpen,
  BookMarked,
  CheckCircle,
  X,
  ArrowLeft,
  Star,
} from "lucide-react";
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

interface UserShelves {
  read: string[];
  toRead: string[];
  reading: string[];
  favorites: string[];
}

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [userShelves, setUserShelves] = useState<UserShelves>({
    read: [],
    toRead: [],
    reading: [],
    favorites: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Find book from data
  useEffect(() => {
    const foundBook = (booksData as Book[]).find((b) => b.id === bookId);
    setBook(foundBook || null);
    setIsLoading(false);
  }, [bookId]);

  // Fetch user shelves data
  const fetchUserShelves = async () => {
    try {
      const response = await fetch("/api/user/books");
      const data = await response.json();
      setUserShelves(data);
    } catch (error) {
      console.error("Failed to fetch user shelves:", error);
    }
  };

  useEffect(() => {
    fetchUserShelves();
  }, []);

  // Get current shelf status for a book
  const getBookShelfStatus = (bookId: string) => {
    if (userShelves.read.includes(bookId)) return "read";
    if (userShelves.toRead.includes(bookId)) return "toRead";
    if (userShelves.reading.includes(bookId)) return "reading";
    return null;
  };

  // Function to add/move book to a specific shelf
  const moveBookToShelf = async (
    bookId: string,
    shelf: "read" | "toRead" | "reading" | null,
    bookTitle: string
  ) => {
    try {
      // If shelf is null, remove the book from all shelves
      if (shelf === null) {
        const response = await fetch("/api/user/books", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookId: bookId,
          }),
        });

        if (response.ok) {
          // Refresh user shelves after successful update
          await fetchUserShelves();
          alert(`"${bookTitle}" removed from shelf!`);
        } else {
          alert("Failed to remove book from shelf");
        }
        return;
      }

      const response = await fetch("/api/user/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: bookId,
          shelf: shelf,
        }),
      });

      if (response.ok) {
        // Refresh user shelves after successful update
        await fetchUserShelves();
        const shelfNames = {
          read: "Read",
          toRead: "Want to Read",
          reading: "Currently Reading",
        };
        alert(`"${bookTitle}" moved to ${shelfNames[shelf]}!`);
      } else {
        alert("Failed to update book shelf");
      }
    } catch (error) {
      console.error("Error updating book shelf:", error);
      alert("Error updating book shelf");
    }
  };

  // Component for shelf selection button
  const ShelfButton = ({
    bookId,
    bookTitle,
  }: {
    bookId: string;
    bookTitle: string;
  }) => {
    const currentShelf = getBookShelfStatus(bookId);

    const getButtonConfig = () => {
      switch (currentShelf) {
        case "read":
          return {
            icon: CheckCircle,
            text: "Read",
            className: "text-gray-700 border border-gray-300",
            style: { backgroundColor: "#f5f1e9" },
          };
        case "reading":
          return {
            icon: BookOpen,
            text: "Reading",
            className: "text-gray-700 border border-gray-300",
            style: { backgroundColor: "#f5f1e9" },
          };
        case "toRead":
          return {
            icon: BookMarked,
            text: "Want to Read",
            className: "text-gray-700 border border-gray-300",
            style: { backgroundColor: "#f5f1e9" },
          };
        default:
          return {
            icon: BookMarked,
            text: "Want to Read",
            className: "bg-green-600 hover:bg-green-700 text-white",
            style: {},
          };
      }
    };

    const { icon: Icon, text, className, style } = getButtonConfig();

    // Always show dropdown for shelf selection
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${className}`}
            style={style}
          >
            <Icon className="w-4 h-4" />
            {text} <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg">
          {currentShelf !== "toRead" && (
            <DropdownMenuItem
              onClick={() => moveBookToShelf(bookId, "toRead", bookTitle)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <BookMarked className="w-4 h-4" />
              Want to Read
            </DropdownMenuItem>
          )}
          {currentShelf !== "reading" && (
            <DropdownMenuItem
              onClick={() => moveBookToShelf(bookId, "reading", bookTitle)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Currently Reading
            </DropdownMenuItem>
          )}
          {currentShelf !== "read" && (
            <DropdownMenuItem
              onClick={() => moveBookToShelf(bookId, "read", bookTitle)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Read
            </DropdownMenuItem>
          )}
          {/* Add separator and remove option for any shelf */}
          {currentShelf && (
            <>
              <div className="border-t border-gray-200 my-1"></div>
              <DropdownMenuItem
                onClick={() => moveBookToShelf(bookId, null, bookTitle)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 cursor-pointer text-red-600"
              >
                <X className="w-4 h-4" />
                Remove from Shelf
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
            </div>
            <div className="md:col-span-2">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Book Not Found
          </h1>
          <p className="text-gray-600">
            The book you're looking for doesn't exist in our database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Book Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="sticky top-8">
            <div className="aspect-[3/4] relative mb-4 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Shelf Button */}
            <div className="space-y-3">
              <ShelfButton bookId={book.id} bookTitle={book.title} />

              {/* Rating placeholder */}
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gray-300" />
                  ))}
                </div>
                <span>Rate this book</span>
              </div>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="md:col-span-2">
          <div className="space-y-6">
            {/* Title and Author */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600">by {book.author}</p>
            </div>

            {/* Genres */}
            {book.genres && book.genres.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {book.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {book.description}
              </p>
            </div>

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Book Details */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Details
              </h3>
              <dl className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Book ID:</dt>
                  <dd className="text-gray-900 font-mono text-xs">{book.id}</dd>
                </div>
                {book.genres && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Primary Genre:</dt>
                    <dd className="text-gray-900">{book.genres[0]}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
