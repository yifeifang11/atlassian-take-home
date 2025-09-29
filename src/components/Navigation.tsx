"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  genres: string[];
}

export function Navigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results.books || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookClick = (bookId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/book/${bookId}`);
  };

  return (
    <nav className="bg-[#f9f7f4] shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/goodreads-logo.svg"
                alt="Goodreads"
                width={120}
                height={36}
                className="h-9"
              />
            </Link>
          </div>

          {/* Search Bar */}
          <div
            className="flex-1 max-w-lg mx-8 relative flex items-center"
            ref={searchRef}
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search books by title or author..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen &&
              (searchQuery.length > 2 || searchResults.length > 0) && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => handleBookClick(book.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                        >
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                            {book.coverUrl ? (
                              <img
                                src={book.coverUrl}
                                alt={book.title}
                                className="w-12 h-16 object-cover rounded"
                              />
                            ) : (
                              <BookOpen className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {book.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              by {book.author}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {book.genres.join(", ")}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length > 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      No books found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-amber-600 px-3 py-2 font-sans"
            >
              Home
            </Link>

            <Link
              href="/bookshelves"
              className="text-gray-700 hover:text-amber-600 px-3 py-2 font-sans"
            >
              My Library
            </Link>

            <Link
              href="/profile"
              className="text-gray-700 hover:text-amber-600 px-3 py-2 font-sans"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
