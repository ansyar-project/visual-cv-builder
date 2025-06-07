import { requireAuth } from "@/lib/session";
import CVForm from "@/components/CVForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New CV - Professional Resume Builder | VisualCV Builder",
  description:
    "Create a new professional CV with our intuitive form. Add your experience, skills, education, and download as PDF instantly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CreateCV() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New CV</h1>
          <p className="mt-2 text-gray-600">
            Fill in your information to create a professional CV
          </p>
        </div>

        <CVForm />
      </div>
    </div>
  );
}
