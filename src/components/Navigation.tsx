import Link from "next/link";
import { Book, Home, User } from "lucide-react";

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-amber-600" />
              <span className="text-xl font-bold text-gray-900">
                AI Goodreads
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center space-x-1 text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md"
            >
              <User className="h-4 w-4" />
              <span>My Library</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
