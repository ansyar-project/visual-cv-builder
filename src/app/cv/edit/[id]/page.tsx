import { requireAuth } from "@/lib/session";
import { cvOperations } from "@/lib/db";
import { notFound } from "next/navigation";
import CVForm from "@/components/CVForm";
import type { CVData } from "@/lib/db";
import { DEFAULT_THEME } from "@/lib/cv-themes";

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
  // Ensure content is always an object and has a theme property
  // Defensive: ensure cv.content is an object
  // Ensure all required fields for CVData are present
  type ContentRaw = {
    title?: string;
    theme?: string;
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
    };
    summary?: string;
    experience?: Array<{
      position?: string;
      company?: string;
      duration?: string;
      description?: string;
    }>;
    education?: Array<{
      degree?: string;
      institution?: string;
      year?: string;
      description?: string;
    }>;
    skills?: string[];
  };
  const contentRaw: ContentRaw =
    cv.content && typeof cv.content === "object" && !Array.isArray(cv.content)
      ? (cv.content as ContentRaw)
      : {};
  const content: CVData = {
    title:
      typeof contentRaw.title === "string" ? contentRaw.title : cv.title || "",
    theme: contentRaw.theme || DEFAULT_THEME.id,
    personalInfo: {
      name: contentRaw.personalInfo?.name || "",
      email: contentRaw.personalInfo?.email || "",
      phone: contentRaw.personalInfo?.phone || "",
      location: contentRaw.personalInfo?.location || "",
      linkedin: contentRaw.personalInfo?.linkedin || "",
      github: contentRaw.personalInfo?.github || "",
    },
    summary: contentRaw.summary || "",
    experience: Array.isArray(contentRaw.experience)
      ? contentRaw.experience.map((exp) => ({
          position: exp.position || "",
          company: exp.company || "",
          duration: exp.duration || "",
          description: exp.description || "",
        }))
      : [{ position: "", company: "", duration: "", description: "" }],
    education: Array.isArray(contentRaw.education)
      ? contentRaw.education.map((edu) => ({
          degree: edu.degree || "",
          institution: edu.institution || "",
          year: edu.year || "",
          description: edu.description || "",
        }))
      : [{ degree: "", institution: "", year: "", description: "" }],
    skills: Array.isArray(contentRaw.skills)
      ? contentRaw.skills.map((s) => s || "")
      : [""],
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Edit CV</h1>
          <p className="mt-1 text-gray-600">Update your CV information</p>
        </div>

        <CVForm
          initialData={{
            id: cv.id,
            title: cv.title,
            content: content,
            template: cv.template,
          }}
        />
      </div>
    </div>
  );
}
