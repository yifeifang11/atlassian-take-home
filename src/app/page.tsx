"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Search, TrendingUp, Heart, Coffee } from "lucide-react";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Your Next Favorite Book
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get personalized AI-powered recommendations based on your taste
        </p>
      </div>

      <Card className="max-w-2xl mx-auto mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Want a personalized recommendation?
          </CardTitle>
          <CardDescription>
            Describe what you're looking for or choose from our suggestions
            below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., I want something like The Martian but funnier&hellip;"
              value={query}
              onChange={(e) => {
                console.log("Input changed:", e.target.value);
                setQuery(e.target.value);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={!query.trim()}
              className={!query.trim() ? "opacity-50" : ""}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Or try these popular requests:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((preset, index) => {
                const IconComponent = preset.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => handlePresetClick(preset.text)}
                  >
                    <IconComponent className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">{preset.text}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">0</div>
            <div className="text-sm text-gray-600">Books Read</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-sm text-gray-600">Want to Read</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-gray-600">Currently Reading</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your reading activity will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BookIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              Start by adding some books to your shelves or getting
              recommendations!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
