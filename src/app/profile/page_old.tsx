"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  MapPin, 
  Calendar, 
  Mail, 
  BookOpen, 
  Heart,
  Settings,
  Save
} from "lucide-react";

interface UserPreferences {
  favoriteGenres: string[];
  preferredLength: string;
  readingGoal: number;
  contentWarnings: string[];
  languagePreference: string;
}

interface UserStats {
  booksRead: number;
  currentlyReading: number;
  wantToRead: number;
  totalPages: number;
}

export default function ProfilePage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteGenres: ["Fiction", "Mystery", "Science Fiction"],
    preferredLength: "medium",
    readingGoal: 24,
    contentWarnings: ["violence", "explicit content"],
    languagePreference: "English"
  });

  const [userStats, setUserStats] = useState<UserStats>({
    booksRead: 0,
    currentlyReading: 0,
    wantToRead: 0,
    totalPages: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch user stats from API
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch("/api/user/books");
        const data = await response.json();
        setUserStats({
          booksRead: data.read?.length || 0,
          currentlyReading: data.reading?.length || 0,
          wantToRead: data.toRead?.length || 0,
          totalPages: (data.read?.length || 0) * 250 // Estimated 250 pages per book
        });
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };

    fetchUserStats();
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    }
  }, []);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleGenreToggle = (genre: string) => {
    const newGenres = preferences.favoriteGenres.includes(genre)
      ? preferences.favoriteGenres.filter(g => g !== genre)
      : [...preferences.favoriteGenres, genre];
    
    handlePreferenceChange("favoriteGenres", newGenres);
  };

  const handleContentWarningToggle = (warning: string) => {
    const newWarnings = preferences.contentWarnings.includes(warning)
      ? preferences.contentWarnings.filter(w => w !== warning)
      : [...preferences.contentWarnings, warning];
    
    handlePreferenceChange("contentWarnings", newWarnings);
  };

  const savePreferences = async () => {
    try {
      // For now, just simulate saving to localStorage
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      setHasUnsavedChanges(false);
      setIsEditing(false);
      alert("Preferences saved successfully!");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert("Failed to save preferences");
    }
  };

  const availableGenres = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", 
    "Fantasy", "Biography", "History", "Self-Help", "Business",
    "Psychology", "Philosophy", "Horror", "Thriller", "Young Adult",
    "Poetry", "Drama", "Comedy", "Adventure", "Crime"
  ];

  const contentWarningOptions = [
    "violence", "explicit content", "strong language", "sexual content",
    "substance abuse", "mental health", "death/grief", "animal harm"
  ];

  const lengthOptions = [
    { value: "short", label: "Short (< 200 pages)" },
    { value: "medium", label: "Medium (200-400 pages)" },
    { value: "long", label: "Long (400+ pages)" },
    { value: "any", label: "Any length" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {isEditing ? "Cancel" : "Edit Preferences"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Alex Johnson
                </h2>
                <p className="text-gray-600 mb-4">Avid Reader & Book Lover</p>
                
                <div className="space-y-2 text-sm text-gray-600 w-full">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined March 2023</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>alex.johnson@email.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reading Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Reading Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.booksRead}</div>
                  <div className="text-sm text-gray-600">Books Read</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.currentlyReading}</div>
                  <div className="text-sm text-gray-600">Currently Reading</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{userStats.wantToRead}</div>
                  <div className="text-sm text-gray-600">Want to Read</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userStats.totalPages.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Pages Read</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Annual Goal</span>
                  <span className="text-sm font-medium">{userStats.booksRead} / {preferences.readingGoal} books</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((userStats.booksRead / preferences.readingGoal) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preferences */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Reading Preferences</CardTitle>
              {isEditing && hasUnsavedChanges && (
                <Button onClick={savePreferences} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Favorite Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Favorite Genres
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => isEditing && handleGenreToggle(genre)}
                      disabled={!isEditing}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        preferences.favoriteGenres.includes(genre)
                          ? "bg-amber-100 border-amber-300 text-amber-800"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      } ${isEditing ? "hover:bg-amber-50 cursor-pointer" : "cursor-default"}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Book Length
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {lengthOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => isEditing && handlePreferenceChange("preferredLength", option.value)}
                      disabled={!isEditing}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        preferences.preferredLength === option.value
                          ? "bg-amber-100 border-amber-300 text-amber-800"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      } ${isEditing ? "hover:bg-amber-50 cursor-pointer" : "cursor-default"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Annual Reading Goal
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={preferences.readingGoal}
                    onChange={(e) => handlePreferenceChange("readingGoal", parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className="w-24"
                    min="1"
                    max="365"
                  />
                  <span className="text-sm text-gray-600">books per year</span>
                </div>
              </div>

              {/* Content Warnings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content to Avoid
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {contentWarningOptions.map((warning) => (
                    <button
                      key={warning}
                      onClick={() => isEditing && handleContentWarningToggle(warning)}
                      disabled={!isEditing}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        preferences.contentWarnings.includes(warning)
                          ? "bg-red-100 border-red-300 text-red-800"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      } ${isEditing ? "hover:bg-red-50 cursor-pointer" : "cursor-default"}`}
                    >
                      {warning}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Language Preference
                </label>
                <select
                  value={preferences.languagePreference}
                  onChange={(e) => handlePreferenceChange("languagePreference", e.target.value)}
                  disabled={!isEditing}
                  className="block w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Any">Any Language</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
  }>({});
  </div>
  );
}

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
