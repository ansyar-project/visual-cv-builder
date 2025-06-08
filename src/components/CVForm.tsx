"use client";

import { useState, useRef, useEffect } from "react";
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
import { sanitizeCVData } from "@/lib/sanitization";

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
  // Refs for scroll synchronization
  const formRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingSyncRef = useRef(false);
  // Dynamic height calculation
  const [containerHeight, setContainerHeight] = useState("calc(100vh - 12rem)");

  useEffect(() => {
    const updateHeight = () => {
      const navbar = document.querySelector("nav");
      const navbarHeight = navbar?.offsetHeight || 64; // fallback to 4rem
      const pageHeaderHeight = 120; // Approximate header height
      const padding = 32; // Additional padding

      // Mobile adjustments
      const isMobile = window.innerWidth < 1280; // xl breakpoint
      const mobileOffset = isMobile ? 40 : 0; // Extra space for mobile

      const totalOffset =
        navbarHeight + pageHeaderHeight + padding + mobileOffset;
      setContainerHeight(`calc(100vh - ${totalOffset}px)`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);
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
  // Scroll synchronization effect
  useEffect(() => {
    const formElement = formRef.current;
    const previewElement = previewRef.current;

    if (!formElement || !previewElement) return;
    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      if (isScrollingSyncRef.current) return;

      isScrollingSyncRef.current = true;

      const sourceMaxScroll = source.scrollHeight - source.clientHeight;
      const targetMaxScroll = target.scrollHeight - target.clientHeight;

      // Don't sync if either container doesn't need scrolling
      if (sourceMaxScroll <= 0 || targetMaxScroll <= 0) {
        isScrollingSyncRef.current = false;
        return;
      }

      const sourceScrollPercentage = source.scrollTop / sourceMaxScroll;
      const targetScrollPosition = Math.min(
        sourceScrollPercentage * targetMaxScroll,
        targetMaxScroll
      );

      target.scrollTop = targetScrollPosition;

      setTimeout(() => {
        isScrollingSyncRef.current = false;
      }, 50); // Reduced timeout for smoother sync
    };

    const handleFormScroll = () => syncScroll(formElement, previewElement);
    const handlePreviewScroll = () => syncScroll(previewElement, formElement);

    formElement.addEventListener("scroll", handleFormScroll, { passive: true });
    previewElement.addEventListener("scroll", handlePreviewScroll, {
      passive: true,
    });

    return () => {
      formElement.removeEventListener("scroll", handleFormScroll);
      previewElement.removeEventListener("scroll", handlePreviewScroll);
    };
  }, []);

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
      // Sanitize data before sending to server
      const sanitizedData = sanitizeCVData(cvData);

      const url = initialData ? `/api/cv/${initialData.id}` : "/api/cv";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
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
      // Sanitize data before sending to server
      const sanitizedData = sanitizeCVData(cvData);

      const url = initialData
        ? `/api/cv/${initialData.id}/generate`
        : "/api/cv/generate";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-none mx-auto px-2 min-h-screen">
      {/* Form Section */}
      <div
        ref={formRef}
        className="space-y-6 overflow-y-auto pr-4 scroll-sync-container"
        style={{ maxHeight: containerHeight }}
      >
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
      </div>{" "}
      {/* Preview Section */}
      <div
        ref={previewRef}
        className="bg-background rounded-lg border overflow-hidden flex flex-col"
        style={{ maxHeight: containerHeight }}
      >
        <h2 className="text-xl font-semibold p-4 pb-3 bg-background border-b">
          Preview
        </h2>
        <div className="flex-1 p-4 pt-3 overflow-y-auto">
          <CVPreview data={cvData} />
        </div>
      </div>
    </div>
  );
}
