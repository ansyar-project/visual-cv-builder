// Custom 404 page with SEO optimization
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | VisualCV Builder",
  description:
    "The page you are looking for could not be found. Return to VisualCV Builder to continue creating your professional CV.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>

          <div className="text-sm text-gray-500">
            <Link href="/cv" className="hover:text-blue-600 transition-colors">
              Go to Dashboard
            </Link>
            {" | "}
            <Link
              href="/cv/create"
              className="hover:text-blue-600 transition-colors"
            >
              Create New CV
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
