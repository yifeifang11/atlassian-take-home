"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { StarRating } from "@/components/StarRating";

interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverUrl?: string;
  rating?: number;
  userRating?: number;
  dateRead?: string;
  dateAdded?: string;
}

interface UserBooks {
  read: string[];
  toRead: string[];
  reading: string[];
  favorites: string[];
}

export default function BookshelvesPage() {
  const [selectedShelf, setSelectedShelf] = useState<
    "all" | "read" | "toRead" | "reading"
  >("all");
  const [userBooks, setUserBooks] = useState<UserBooks>({
    read: [],
    toRead: [],
    reading: [],
    favorites: [],
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user ratings for books (optimized batch request)
  const fetchUserRatings = async (bookIds: string[]) => {
    if (bookIds.length === 0) return [];

    try {
      const response = await fetch(
        `/api/user/ratings?bookIds=${bookIds.join(",")}`
      );
      const data = await response.json();

      // Convert the ratings map back to the expected format
      return bookIds.map((bookId) => ({
        bookId,
        rating: data.ratings[bookId] || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch ratings:", error);
      return bookIds.map((bookId) => ({ bookId, rating: 0 }));
    }
  };

  // Fetch user's book data
  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const response = await fetch("/api/user/books");
        const data = await response.json();
        setUserBooks(data);
        return data; // Return the data to use in the next step
      } catch (error) {
        console.error("Failed to fetch user books:", error);
        return { read: [], toRead: [], reading: [], favorites: [] };
      }
    };

    const fetchAllBooks = async (userBooksData: UserBooks) => {
      try {
        const response = await fetch("/api/books");
        const data = await response.json();

        // Only fetch ratings for books that are marked as "read"
        // since those are the only ones that can have ratings
        const readBookIds = userBooksData.read || [];
        const ratings =
          readBookIds.length > 0 ? await fetchUserRatings(readBookIds) : [];

        // Create a ratings map
        const ratingsMap = ratings.reduce((acc, { bookId, rating }) => {
          acc[bookId] = rating;
          return acc;
        }, {} as Record<string, number>);

        // Add user ratings to books (only for read books)
        const booksWithRatings = data.map((book: Book) => ({
          ...book,
          userRating: ratingsMap[book.id] || 0,
        }));

        setBooks(booksWithRatings);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      }
    };

    const loadData = async () => {
      const userBooksData = await fetchUserBooks();
      await fetchAllBooks(userBooksData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Filter books based on selected shelf
  useEffect(() => {
    if (!books.length || !userBooks) return;

    let booksOnShelf: Book[] = [];

    if (selectedShelf === "all") {
      // Show all books that are on any shelf
      const allBookIds = [
        ...userBooks.read,
        ...userBooks.toRead,
        ...userBooks.reading,
      ];
      booksOnShelf = books.filter((book) =>
        allBookIds.includes(book.id.toString())
      );
    } else {
      const shelfBooks = userBooks[selectedShelf] || [];
      booksOnShelf = books.filter((book) =>
        shelfBooks.includes(book.id.toString())
      );
    }

    // Apply search filter
    const filtered = searchQuery
      ? booksOnShelf.filter(
          (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : booksOnShelf;

    setFilteredBooks(filtered);
  }, [selectedShelf, userBooks, books, searchQuery]);

  const getShelfTitle = () => {
    switch (selectedShelf) {
      case "all":
        return "All Books";
      case "read":
        return "Read";
      case "toRead":
        return "Want to Read";
      case "reading":
        return "Currently Reading";
      default:
        return "All Books";
    }
  };

  const getShelfCount = (shelf: string) => {
    if (!userBooks) return 0;

    if (shelf === "all") {
      // Return total count of all books across all shelves
      return (
        userBooks.read.length +
        userBooks.toRead.length +
        userBooks.reading.length
      );
    }

    return userBooks[shelf as keyof UserBooks]?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-sans font-semibold mb-4 uppercase">
            Bookshelves
          </h2>

          <div className="space-y-2">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedShelf("all");
              }}
              className={`block text-sm hover:underline ${
                selectedShelf === "all"
                  ? "font-bold text-[#01635d]"
                  : "text-gray-700"
              }`}
            >
              All (
              {userBooks.read?.length +
                userBooks.toRead?.length +
                userBooks.reading?.length || 0}
              )
            </Link>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedShelf("toRead");
              }}
              className={`block text-sm hover:underline ${
                selectedShelf === "toRead"
                  ? "font-bold text-[#01635d]"
                  : "text-gray-700"
              }`}
            >
              Want to Read ({userBooks.toRead?.length || 0})
            </Link>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedShelf("reading");
              }}
              className={`block text-sm hover:underline ${
                selectedShelf === "reading"
                  ? "font-bold text-[#01635d]"
                  : "text-gray-700"
              }`}
            >
              Currently Reading ({userBooks.reading?.length || 0})
            </Link>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedShelf("read");
              }}
              className={`block text-sm hover:underline ${
                selectedShelf === "read"
                  ? "font-bold text-[#01635d]"
                  : "text-gray-700"
              }`}
            >
              Read ({userBooks.read?.length || 0})
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-sans">
              My Books: {getShelfTitle()} ({getShelfCount(selectedShelf)})
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  try {
                    console.log("Setup button clicked");
                    const response = await fetch("/api/setup", {
                      method: "POST",
                    });
                    console.log("Response status:", response.status);
                    console.log("Response ok:", response.ok);

                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error("Response error:", errorText);
                      alert(`Setup failed: ${response.status} - ${errorText}`);
                      return;
                    }

                    const data = await response.json();
                    console.log("Setup response:", data);
                    alert(
                      `Setup successful! Books populated: ${data.booksPopulated}, Books count: ${data.booksCount}`
                    );
                    // Refresh the page after setup
                    window.location.reload();
                  } catch (error) {
                    console.error("Setup error:", error);
                    alert(
                      `Setup failed: ${
                        error instanceof Error ? error.message : "Unknown error"
                      }`
                    );
                  }
                }}
                className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 hidden"
              >
                Setup Data
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search and add books"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-white overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cover
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shelves
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Read
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book, index) => (
                  <tr
                    key={book.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link href={`/book/${book.id}`}>
                        <Image
                          src={book.coverUrl || "/placeholder-book.jpg"}
                          alt={book.title}
                          width={40}
                          height={60}
                          className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/book/${book.id}`}>
                        <div className="text-sm book-title font-medium text-[#01635d] hover:underline cursor-pointer">
                          {book.title}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{book.author}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {/* Only show rating for read/reading books */}
                      {selectedShelf === "read" ||
                      selectedShelf === "reading" ||
                      (selectedShelf === "all" &&
                        (userBooks.read.includes(book.id.toString()) ||
                          userBooks.reading.includes(book.id.toString()))) ? (
                        <StarRating
                          bookId={book.id}
                          initialRating={book.userRating || 0}
                          size="sm"
                          readonly={false}
                          onRatingChange={async () => {
                            // Refresh the data to reflect any shelf changes
                            const userBooksResponse = await fetch(
                              "/api/user/books"
                            );
                            const userData = await userBooksResponse.json();
                            setUserBooks(userData);

                            // Re-fetch books with updated ratings
                            const booksResponse = await fetch("/api/books");
                            const booksData = await booksResponse.json();

                            // Only fetch ratings for books that are marked as "read"
                            const readBookIds = userData.read || [];
                            const ratings =
                              readBookIds.length > 0
                                ? await fetchUserRatings(readBookIds)
                                : [];

                            // Create a ratings map
                            const ratingsMap = ratings.reduce(
                              (acc, { bookId, rating }) => {
                                acc[bookId] = rating;
                                return acc;
                              },
                              {} as Record<string, number>
                            );

                            // Add user ratings to books (only for read books)
                            const booksWithRatings = booksData.map(
                              (book: Book) => ({
                                ...book,
                                userRating: ratingsMap[book.id] || 0,
                              })
                            );

                            setBooks(booksWithRatings);
                          }}
                        />
                      ) : (
                        <div className="flex items-center text-sm text-gray-400">
                          <span>-</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-[#01635d] hover:underline cursor-pointer">
                        {getShelfTitle().toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {selectedShelf === "read" ? "Sep 04, 2025" : ""}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      Sep 04, 2025
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBooks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No books found in this shelf.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <div className="text-sm text-gray-600">
              <span>« previous</span>
              <span className="mx-2">1 2 3 4</span>
              <span>next »</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
