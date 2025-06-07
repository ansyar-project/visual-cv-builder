"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CV {
  id: string;
  title: string;
  template: string;
  filePath: string | null;
  createdAt: Date;
  updatedAt: Date;
  content: any;
}

interface CVDashboardProps {
  cvs: CV[];
}

export default function CVDashboard({ cvs }: CVDashboardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (cvId: string) => {
    if (!confirm("Are you sure you want to delete this CV?")) {
      return;
    }

    setLoading(cvId);
    try {
      const response = await fetch(`/api/cv/${cvId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete CV");
      }
    } catch (error) {
      alert("An error occurred while deleting the CV");
    } finally {
      setLoading(null);
    }
  };

  const handleGeneratePDF = async (cv: CV) => {
    setLoading(cv.id);
    try {
      const response = await fetch(`/api/cv/${cv.id}/generate`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.downloadUrl, "_blank");
        router.refresh();
      } else {
        alert("Failed to generate PDF");
      }
    } catch (error) {
      alert("An error occurred while generating the PDF");
    } finally {
      setLoading(null);
    }
  };

  if (cvs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No CVs yet</h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first professional CV
        </p>
        <Link
          href="/cv/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Create Your First CV
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cvs.map((cv) => (
        <div
          key={cv.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-900 truncate">
                {cv.title}
              </h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {cv.template}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              <p>Created: {new Date(cv.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(cv.updatedAt).toLocaleDateString()}</p>
            </div>

            {/* Preview of CV content */}
            <div className="text-sm text-gray-600 mb-4">
              {cv.content?.personalInfo?.name && (
                <p className="font-medium">{cv.content.personalInfo.name}</p>
              )}
              {cv.content?.personalInfo?.email && (
                <p>{cv.content.personalInfo.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex space-x-2">
                <Link
                  href={`/cv/edit/${cv.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded text-sm transition-colors"
                >
                  Edit
                </Link>

                {cv.filePath ? (
                  <a
                    href={`/api/cv/${cv.id}/download`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-3 rounded text-sm transition-colors"
                    download
                  >
                    Download
                  </a>
                ) : (
                  <button
                    onClick={() => handleGeneratePDF(cv)}
                    disabled={loading === cv.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    {loading === cv.id ? "Generating..." : "Generate PDF"}
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDelete(cv.id)}
                disabled={loading === cv.id}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                {loading === cv.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
