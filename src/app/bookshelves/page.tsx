"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Star, Search } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverUrl?: string;
  rating?: number;
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

  // Fetch user's book data
  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const response = await fetch("/api/user/books");
        const data = await response.json();
        setUserBooks(data);
      } catch (error) {
        console.error("Failed to fetch user books:", error);
      }
    };

    const fetchAllBooks = async () => {
      try {
        const response = await fetch("/api/books");
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      }
    };

    Promise.all([fetchUserBooks(), fetchAllBooks()]).finally(() => {
      setIsLoading(false);
    });
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

          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 uppercase">
              Your reading activity
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Review Drafts</div>
              <div>Kindle Notes & Highlights</div>
              <div>Reading Challenge</div>
              <div>Year in Books</div>
              <div>Reading stats</div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 uppercase">Add books</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Amazon book purchases</div>
              <div>Recommendations</div>
              <div>Explore</div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 uppercase">Tools</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Find duplicates</div>
              <div>Widgets</div>
              <div>Import and export</div>
            </div>
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
                className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600"
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
              <div className="text-sm text-gray-600 space-x-2">
                <span>Batch Edit</span>
                <span>Settings</span>
                <span>Stats</span>
                <span>Print</span>
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
                    Avg Rating
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
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-3 w-3 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-xs text-gray-600">4.2</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-3 w-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
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
