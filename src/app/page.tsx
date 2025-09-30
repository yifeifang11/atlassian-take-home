"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Search,
  TrendingUp,
  Heart,
  Coffee,
  Star,
  ChevronDown,
  BookOpen,
  BookMarked,
  CheckCircle,
  X,
} from "lucide-react";
import { ReadingChallenge } from "@/components/ReadingChallenge";

interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverUrl?: string;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [currentlyReading, setCurrentlyReading] = useState<{
    books: Book[];
    isEmpty: boolean;
  }>({
    books: [],
    isEmpty: true,
  });
  const [isLoadingReading, setIsLoadingReading] = useState(true);
  const [wantToReadBooks, setWantToReadBooks] = useState<Book[]>([]);
  const [isLoadingWantToRead, setIsLoadingWantToRead] = useState(true);
  const [userShelves, setUserShelves] = useState<{
    read: string[];
    toRead: string[];
    reading: string[];
  }>({ read: [], toRead: [], reading: [] });
  const router = useRouter();

  // Function to fetch user's shelf data
  const fetchUserShelves = async () => {
    try {
      console.log("Fetching user shelves...");
      const response = await fetch("/api/user/books");
      if (response.ok) {
        const data = await response.json();
        console.log("User shelves data received:", data);
        setUserShelves(data);
      } else {
        console.error("Failed to fetch user shelves - Response not ok:", response.status, response.statusText);
        // Set empty defaults if API fails
        setUserShelves({ read: [], toRead: [], reading: [] });
      }
    } catch (error) {
      console.error("Failed to fetch user shelves:", error);
      // Set empty defaults if API fails
      setUserShelves({ read: [], toRead: [], reading: [] });
    }
  };

  // Function to get book's current shelf status
  const getBookShelfStatus = (
    bookId: string
  ): "read" | "toRead" | "reading" | null => {
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

  // Fetch user shelves data
  useEffect(() => {
    fetchUserShelves();
  }, []);

  // Fetch currently reading books
  useEffect(() => {
    const fetchCurrentlyReading = async () => {
      try {
        console.log("Fetching currently reading books...");
        const response = await fetch("/api/user/reading");
        if (response.ok) {
          const data = await response.json();
          console.log("Currently reading data received:", data);
          setCurrentlyReading(data);
        } else {
          console.error("Failed to fetch currently reading books - Response not ok:", response.status, response.statusText);
          setCurrentlyReading({ books: [], isEmpty: true });
        }
      } catch (error) {
        console.error("Failed to fetch currently reading books:", error);
        setCurrentlyReading({ books: [], isEmpty: true });
      } finally {
        setIsLoadingReading(false);
      }
    };

    fetchCurrentlyReading();
  }, []);

  // Fetch want to read books
  useEffect(() => {
    const fetchWantToReadBooks = async () => {
      try {
        console.log("Fetching want to read books...");
        const response = await fetch("/api/books?shelf=toRead");
        if (response.ok) {
          const data = await response.json();
          console.log("Want to read data received:", data);
          setWantToReadBooks(data.books || []);
        } else {
          console.error("Failed to fetch want to read books - Response not ok:", response.status, response.statusText);
          setWantToReadBooks([]);
        }
      } catch (error) {
        console.error("Failed to fetch want to read books:", error);
        setWantToReadBooks([]);
      } finally {
        setIsLoadingWantToRead(false);
      }
    };

    fetchWantToReadBooks();
  }, []);
  const handleSearch = () => {
    console.log("Search clicked, query:", query);
    if (query.trim()) {
      console.log("Navigating to recommendations with query:", query);
      const url = `/recommendations?q=${encodeURIComponent(query)}`;
      console.log("Full URL:", url);
      try {
        router.push(url);
      } catch (error) {
        console.error("Router.push failed:", error);
        // Fallback to window.location
        window.location.href = url;
      }
    } else {
      console.log("Query is empty, not navigating");
    }
  };

  const handlePresetClick = (preset: string) => {
    console.log("Preset clicked:", preset);
    const url = `/recommendations?q=${encodeURIComponent(preset)}`;
    console.log("Preset URL:", url);
    try {
      router.push(url);
    } catch (error) {
      console.error("Router.push failed for preset:", error);
      // Fallback to window.location
      window.location.href = url;
    }
  };

  const presets = [
    { text: "Cozy fantasy with romance", icon: Heart },
    { text: "Page-turning thrillers", icon: TrendingUp },
    { text: "Coffee shop mystery", icon: Coffee },
    { text: "Science fiction like The Martian", icon: Sparkles },
  ];

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
            size="sm"
            className={`text-xs h-6 ${className}`}
            style={style}
          >
            <Icon className="w-3 h-3 mr-1" />
            {text} <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-40 bg-white border border-gray-200 shadow-lg"
        >
          {currentShelf !== "toRead" && (
            <DropdownMenuItem
              onClick={() => moveBookToShelf(bookId, "toRead", bookTitle)}
              className="text-xs hover:bg-gray-100 cursor-pointer"
            >
              <BookMarked className="w-3 h-3 mr-2" />
              Want to Read
            </DropdownMenuItem>
          )}
          {currentShelf !== "reading" && (
            <DropdownMenuItem
              onClick={() => moveBookToShelf(bookId, "reading", bookTitle)}
              className="text-xs hover:bg-gray-100 cursor-pointer"
            >
              <BookOpen className="w-3 h-3 mr-2" />
              Currently Reading
            </DropdownMenuItem>
          )}
          {currentShelf !== "read" && (
            <DropdownMenuItem
              onClick={() => moveBookToShelf(bookId, "read", bookTitle)}
              className="text-xs hover:bg-gray-100 cursor-pointer"
            >
              <CheckCircle className="w-3 h-3 mr-2" />
              Read
            </DropdownMenuItem>
          )}
          {/* Add separator and remove option for any shelf */}
          {currentShelf && (
            <>
              <div className="border-t border-gray-200 my-1"></div>
              <DropdownMenuItem
                onClick={() => moveBookToShelf(bookId, null, bookTitle)}
                className="text-xs hover:bg-red-50 cursor-pointer text-red-600"
              >
                <X className="w-3 h-3 mr-2" />
                Remove from Shelf
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          {/* Currently Reading */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 font-sans uppercase">
              CURRENTLY READING
            </h2>
            {isLoadingReading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            ) : currentlyReading.isEmpty ||
              currentlyReading.books.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-sm text-gray-600 mb-3">
                  No books currently being read
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Discover your next great read with our AI recommendations!
                </div>
                <Button
                  size="sm"
                  className="text-xs h-7 bg-[#01635d] hover:bg-[#014a40] text-white"
                  onClick={() => {
                    const aiSection = document.querySelector(
                      "[data-ai-recommendations]"
                    );
                    aiSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Get AI Recommendations
                </Button>
              </div>
            ) : (
              currentlyReading.books.slice(0, 1).map((book) => (
                <div key={book.id}>
                  <div className="flex items-start gap-3">
                    <Link href={`/book/${book.id}`}>
                      <Image
                        src={
                          book.coverUrl ||
                          "https://via.placeholder.com/64x96?text=No+Cover"
                        }
                        alt={book.title}
                        width={64}
                        height={96}
                        className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/book/${book.id}`}>
                        <h3 className="font-medium text-sm leading-tight mb-1 book-title cursor-pointer hover:text-[#01635d] transition-colors">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-600 mb-2">
                        by {book.author}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() =>
                          moveBookToShelf(book.id, "read", book.title)
                        }
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark as Read
                      </Button>
                    </div>
                  </div>
                  {currentlyReading.books.length > 1 && (
                    <div className="mt-3 text-xs text-gray-500">
                      +{currentlyReading.books.length - 1} more book
                      {currentlyReading.books.length > 2 ? "s" : ""}
                    </div>
                  )}
                </div>
              ))
            )}
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7 text-[#01635d] hover:bg-gray-100"
                onClick={() => (window.location.href = "/bookshelves")}
              >
                View all books
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Reading Challenge */}
          <ReadingChallenge booksRead={userShelves.read?.length || 0} />

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Want to Read */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 font-sans uppercase">
              WANT TO READ
            </h2>
            {isLoadingWantToRead ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            ) : wantToReadBooks.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-sm text-gray-600 mb-3">
                  No books in your Want to Read list
                </div>
                <Button
                  size="sm"
                  className="text-xs h-7 bg-[#01635d] hover:bg-[#014a40] text-white"
                  onClick={() => (window.location.href = "/bookshelves")}
                >
                  Add Books
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {wantToReadBooks.slice(0, 3).map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`}>
                      <Image
                        src={
                          book.coverUrl ||
                          "https://via.placeholder.com/60x80?text=No+Cover"
                        }
                        alt={book.title}
                        width={60}
                        height={80}
                        className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>
                  ))}
                  {wantToReadBooks.length < 3 &&
                    Array.from({ length: 3 - wantToReadBooks.length }).map(
                      (_, index) => (
                        <div
                          key={`placeholder-${index}`}
                          className="w-[60px] h-[80px] bg-gray-200 flex items-center justify-center"
                        >
                          <span className="text-xs text-gray-400">+</span>
                        </div>
                      )
                    )}
                </div>
                {wantToReadBooks.length > 3 && (
                  <div className="text-xs text-gray-500 mb-2">
                    +{wantToReadBooks.length - 3} more book
                    {wantToReadBooks.length > 4 ? "s" : ""}
                  </div>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7 text-[#01635d] hover:bg-gray-100"
              onClick={() => (window.location.href = "/bookshelves")}
            >
              View all books
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Bookshelves */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 font-sans uppercase">
              BOOKSHELVES
            </h2>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7 text-[#01635d] hover:bg-gray-100 justify-start"
                onClick={() => (window.location.href = "/bookshelves")}
              >
                All (12)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7 text-[#01635d] hover:bg-gray-100 justify-start"
                onClick={() => (window.location.href = "/bookshelves")}
              >
                Want to Read (7)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7 text-[#01635d] hover:bg-gray-100 justify-start"
                onClick={() => (window.location.href = "/bookshelves")}
              >
                Currently Reading (2)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7 text-[#01635d] hover:bg-gray-100 justify-start"
                onClick={() => (window.location.href = "/bookshelves")}
              >
                Read (5)
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendations Section */}
          <Card
            data-ai-recommendations
            className="relative overflow-hidden border border-amber-200 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/30 via-transparent to-yellow-100/20"></div>
            <div className="relative z-10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-sans uppercase flex items-center gap-2 text-amber-800">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  AI BOOK RECOMMENDATIONS
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Tell us what you're in the mood for and get personalized book
                  recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g., happy books, sci-fi adventure, cozy mystery..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 bg-white border-amber-200 placeholder:text-gray-500"
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={!query.trim()}
                      className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Get Recommendations
                    </Button>
                  </div>

                  <div className="text-sm text-amber-700">
                    <span className="font-medium">Quick suggestions:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetClick(preset.text)}
                        className="text-xs h-8 flex items-center gap-1 bg-white/60 border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <preset.icon className="h-3 w-3" />
                        {preset.text}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Updates Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-sans uppercase font-semibold">
                UPDATES
              </h2>
            </div>

            <div className="space-y-4">
              {/* Update 1 */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Janice+Chung&size=40&background=6B7280&color=ffffff&rounded=true"
                      alt="Janice Chung"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          Janice Chung
                        </span>
                        <span className="text-xs text-gray-500">
                          wants to read
                        </span>
                        <span className="text-xs text-gray-500">2w</span>
                      </div>
                      <div className="flex gap-3">
                        <Link href="/book/dune">
                          <img
                            src="https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg"
                            alt="Dune"
                            className="w-16 h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </Link>
                        <div>
                          <Link href="/book/dune">
                            <h3 className="font-medium text-sm mb-1 book-title hover:underline cursor-pointer text-[#01635d]">
                              Dune
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-600 mb-2">
                            by Frank Herbert
                          </p>
                          <ShelfButton bookId="dune" bookTitle="Dune" />
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs">Rate it:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 text-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Update 2 */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Marcus+Rivera&size=40&background=6B7280&color=ffffff&rounded=true"
                      alt="Marcus Rivera"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          Marcus Rivera
                        </span>
                        <span className="text-xs text-gray-500">rated</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">1w</span>
                      </div>
                      <div className="flex gap-3">
                        <Link href="/book/atomic_habits">
                          <img
                            src="https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg"
                            alt="Atomic Habits"
                            className="w-16 h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </Link>
                        <div>
                          <Link href="/book/atomic_habits">
                            <h3 className="font-medium text-sm mb-1 book-title hover:underline cursor-pointer text-[#01635d]">
                              Atomic Habits
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-600 mb-2">
                            by James Clear
                          </p>
                          <ShelfButton
                            bookId="atomic_habits"
                            bookTitle="Atomic Habits"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Update 3 */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Sarah+Kim&size=40&background=6B7280&color=ffffff&rounded=true"
                      alt="Sarah Kim"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">Sarah Kim</span>
                        <span className="text-xs text-gray-500">
                          wants to read
                        </span>
                        <span className="text-xs text-gray-500">3d</span>
                      </div>
                      <div className="flex gap-3">
                        <Link href="/book/sapiens">
                          <img
                            src="https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg"
                            alt="Sapiens"
                            className="w-16 h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </Link>
                        <div>
                          <Link href="/book/sapiens">
                            <h3 className="font-medium text-sm mb-1 book-title hover:underline cursor-pointer text-[#01635d]">
                              Sapiens
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-600 mb-2">
                            by Yuval Noah Harari
                          </p>
                          <ShelfButton bookId="sapiens" bookTitle="Sapiens" />
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs">Rate it:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 text-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Update 4 */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Alex+Chen&size=40&background=6B7280&color=ffffff&rounded=true"
                      alt="Alex Chen"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">Alex Chen</span>
                        <span className="text-xs text-gray-500">
                          finished reading
                        </span>
                        <span className="text-xs text-gray-500">5d</span>
                      </div>
                      <div className="flex gap-3">
                        <Link href="/book/circe">
                          <img
                            src="https://covers.openlibrary.org/b/isbn/9780316556347-L.jpg"
                            alt="Circe"
                            className="w-16 h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </Link>
                        <div>
                          <Link href="/book/circe">
                            <h3 className="font-medium text-sm mb-1 book-title hover:underline cursor-pointer text-[#01635d]">
                              Circe
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-600 mb-2">
                            by Madeline Miller
                          </p>
                          <ShelfButton bookId="circe" bookTitle="Circe" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* News & Interviews */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-sans uppercase">
                NEWS & INTERVIEWS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-blue-600 mb-2 leading-tight">
                    Horror for Beginners: A Guide to Horror Reading Based on
                    Your Go-To Genre
                  </h3>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=120&fit=crop"
                    alt="Horror books"
                    className="w-full h-24 object-cover mb-2"
                  />
                  <p className="text-xs text-gray-600">74 likes</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-600 mb-2 leading-tight">
                    The Rise of BookTok: How Social Media is Reshaping Reading
                    Culture
                  </h3>
                  <img
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=240&h=120&fit=crop"
                    alt="BookTok and social media reading"
                    className="w-full h-24 object-cover mb-2"
                  />
                  <p className="text-xs text-gray-600">142 likes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
