"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CVPreview from "./CVPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, FileDown, AlertCircle } from "lucide-react";

interface CVData {
  title: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    position: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  skills: string[];
}

interface CVFormProps {
  initialData?: {
    id: string;
    title: string;
    content: any;
    template: string;
  };
}

export default function CVForm({ initialData }: CVFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cvData, setCvData] = useState<CVData>({
    title: initialData?.title || "",
    personalInfo: {
      name: initialData?.content?.personalInfo?.name || "",
      email: initialData?.content?.personalInfo?.email || "",
      phone: initialData?.content?.personalInfo?.phone || "",
      location: initialData?.content?.personalInfo?.location || "",
    },
    summary: initialData?.content?.summary || "",
    experience: initialData?.content?.experience || [
      { position: "", company: "", duration: "", description: "" },
    ],
    education: initialData?.content?.education || [
      { degree: "", institution: "", year: "", description: "" },
    ],
    skills: initialData?.content?.skills || [""],
  });

  const addExperience = () => {
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { position: "", company: "", duration: "", description: "" },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addEducation = () => {
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", year: "", description: "" },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addSkill = () => {
    setCvData((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const removeSkill = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const url = initialData ? `/api/cv/${initialData.id}` : "/api/cv";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cvData),
      });

      if (response.ok) {
        router.push("/cv");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save CV");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    setError("");

    try {
      const url = initialData
        ? `/api/cv/${initialData.id}/generate`
        : "/api/cv/generate";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cvData),
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.downloadUrl, "_blank");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to generate PDF");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-none mx-auto p-6">
      {/* Form Section */}
      <div className="space-y-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              CV Information
            </CardTitle>
            <CardDescription>
              Fill in your details to create a professional CV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* CV Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">CV Title</label>
              <Input
                value={cvData.title}
                onChange={(e) =>
                  setCvData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Software Engineer CV"
              />
            </div>

            {/* Professional Summary */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Professional Summary
              </label>
              <Textarea
                rows={4}
                value={cvData.summary}
                onChange={(e) =>
                  setCvData((prev) => ({ ...prev, summary: e.target.value }))
                }
                placeholder="Brief overview of your professional background and key achievements..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={cvData.personalInfo.name}
                  onChange={(e) =>
                    setCvData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        name: e.target.value,
                      },
                    }))
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={cvData.personalInfo.email}
                  onChange={(e) =>
                    setCvData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        email: e.target.value,
                      },
                    }))
                  }
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={cvData.personalInfo.phone}
                  onChange={(e) =>
                    setCvData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        phone: e.target.value,
                      },
                    }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={cvData.personalInfo.location}
                  onChange={(e) =>
                    setCvData((prev) => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        location: e.target.value,
                      },
                    }))
                  }
                  placeholder="New York, NY"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Experience</CardTitle>
                <CardDescription>Add your work experience</CardDescription>
              </div>
              <Button
                onClick={addExperience}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cvData.experience.map((exp, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      Experience {index + 1}
                    </CardTitle>
                    {cvData.experience.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Position</label>
                      <Input
                        value={exp.position}
                        onChange={(e) =>
                          updateExperience(index, "position", e.target.value)
                        }
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company</label>
                      <Input
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(index, "company", e.target.value)
                        }
                        placeholder="Tech Corp"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <Input
                      value={exp.duration}
                      onChange={(e) =>
                        updateExperience(index, "duration", e.target.value)
                      }
                      placeholder="Jan 2020 - Present"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(index, "description", e.target.value)
                      }
                      placeholder="Describe your key responsibilities and achievements..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Education</CardTitle>
                <CardDescription>
                  Add your educational background
                </CardDescription>
              </div>
              <Button
                onClick={addEducation}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cvData.education.map((edu, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      Education {index + 1}
                    </CardTitle>
                    {cvData.education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Degree</label>
                      <Input
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(index, "degree", e.target.value)
                        }
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Institution</label>
                      <Input
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(index, "institution", e.target.value)
                        }
                        placeholder="University Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <Input
                      value={edu.year}
                      onChange={(e) =>
                        updateEducation(index, "year", e.target.value)
                      }
                      placeholder="2018-2022"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      rows={2}
                      value={edu.description}
                      onChange={(e) =>
                        updateEducation(index, "description", e.target.value)
                      }
                      placeholder="Relevant coursework, achievements, GPA..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add your technical and soft skills
                </CardDescription>
              </div>
              <Button
                onClick={addSkill}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cvData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="e.g., JavaScript, React, Node.js"
                    className="flex-1"
                  />
                  {cvData.skills.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save CV"}
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={loading}
            variant="outline"
            className="flex-1 flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            {loading ? "Generating..." : "Generate PDF"}
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-background rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <CVPreview data={cvData} />
      </div>
    </div>
  );
}
