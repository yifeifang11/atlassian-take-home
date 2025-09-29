import Link from "next/link";
import Image from "next/image";

export function Navigation() {
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
          </div>
        </div>
      </div>
    </nav>
  );
}
