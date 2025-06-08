import { requireAuth } from "@/lib/session";
import { cvOperations } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My CVs - Dashboard | VisualCV Builder",
  description:
    "Access and manage your professional CV collection. Create new resumes, edit existing ones, and track your job applications.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CVDashboard() {
  const user = await requireAuth();
  const cvs = await cvOperations.findAllByUserId(user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My CVs</h1>
          <p className="mt-2 text-gray-600">
            Create and manage your professional CVs
          </p>
        </div>

        <div className="mb-6">
          <Link
            href="/cv/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create New CV
          </Link>
        </div>

        {cvs.length === 0 ? (
          <div className="text-center py-12">
            {" "}
            <div className="text-gray-500 text-lg">
              You haven&apos;t created any CVs yet.
            </div>
            <Link
              href="/cv/create"
              className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create Your First CV
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map((cv) => (
              <div key={cv.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {cv.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Updated {new Date(cv.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  <Link
                    href={`/cv/edit/${cv.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded text-sm transition-colors"
                  >
                    Edit
                  </Link>
                  {cv.filePath && (
                    <a
                      href={`/api/cv/${cv.id}/download`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-3 rounded text-sm transition-colors"
                      download
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
