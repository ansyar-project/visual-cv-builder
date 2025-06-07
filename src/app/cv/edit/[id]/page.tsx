import { requireAuth } from "@/lib/session";
import { cvOperations } from "@/lib/db";
import { notFound } from "next/navigation";
import CVForm from "@/components/CVForm";

interface EditCVPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCV({ params }: EditCVPageProps) {
  const { id } = await params;
  const user = await requireAuth();
  const cv = await cvOperations.findByIdAndUserId(id, user.id);

  if (!cv) {
    notFound();
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit CV</h1>
          <p className="mt-2 text-gray-600">Update your CV information</p>
        </div>

        <CVForm initialData={cv} />
      </div>
    </div>
  );
}
