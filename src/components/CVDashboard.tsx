"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Download, Trash2, Plus, Calendar, User, Mail } from "lucide-react";

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
      <Card className="text-center py-12 border-dashed">
        <CardContent className="pt-6">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl mb-2">No CVs yet</CardTitle>
          <CardDescription className="mb-6">
            Get started by creating your first professional CV
          </CardDescription>
          <Button asChild size="lg">
            <Link href="/cv/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First CV
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cvs.map((cv) => (
        <Card key={cv.id} className="hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-lg truncate pr-2">
                {cv.title}
              </CardTitle>
              <Badge variant="secondary" className="shrink-0">
                {cv.template}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created: {new Date(cv.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated: {new Date(cv.updatedAt).toLocaleDateString()}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Preview of CV content */}
            <div className="mb-4 p-3 bg-muted/50 rounded-md">
              {cv.content?.personalInfo?.name && (
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <p className="font-medium text-sm">{cv.content.personalInfo.name}</p>
                </div>
              )}
              {cv.content?.personalInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{cv.content.personalInfo.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link href={`/cv/edit/${cv.id}`}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Link>
                </Button>

                {cv.filePath ? (
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={`/api/cv/${cv.id}/download`} download>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </a>
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleGeneratePDF(cv)}
                    disabled={loading === cv.id}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {loading === cv.id ? (
                      <>
                        <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3 mr-1" />
                        Generate PDF
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Button
                onClick={() => handleDelete(cv.id)}
                disabled={loading === cv.id}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                {loading === cv.id ? (
                  <>
                    <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
