import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { getThemeById } from "@/lib/cv-themes";
import {
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Github,
  Linkedin,
} from "lucide-react";

interface CVPreviewProps {
  data: {
    theme?: string;
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      linkedin: string;
      github: string;
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
  };
}

export default function CVPreview({ data }: CVPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const theme = getThemeById(data.theme || "professional-blue");

  // Apply theme to preview container
  useEffect(() => {
    if (previewRef.current) {
      // Remove existing theme classes
      previewRef.current.className = previewRef.current.className
        .split(" ")
        .filter((cls) => !cls.startsWith("cv-theme-"))
        .join(" ");

      // Add new theme class if not default
      if (theme.className) {
        previewRef.current.classList.add(theme.className);
      }
    }
  }, [theme]);

  const filteredExperience = data.experience.filter(
    (exp) => exp.position || exp.company || exp.duration || exp.description
  );

  const filteredEducation = data.education.filter(
    (edu) => edu.degree || edu.institution || edu.year || edu.description
  );

  const filteredSkills = data.skills.filter((skill) => skill.trim());

  return (
    <div ref={previewRef} className="w-full max-w-full mx-auto">
      <Card className="h-full shadow-lg overflow-hidden">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div
            className="text-center pb-6 mb-8"
            style={{
              borderBottom: `3px solid hsl(var(--cv-primary))`,
              background: `linear-gradient(135deg, hsl(var(--cv-gradient-start)) 0%, hsl(var(--cv-gradient-end)) 100%)`,
              borderRadius: "8px 8px 0 0",
              margin: "-1.5rem -2rem 2rem -2rem",
              padding: "2rem 2rem 1.5rem 2rem",
            }}
          >
            <h1
              className="text-4xl font-bold mb-3"
              style={{ color: `hsl(var(--cv-text-primary))` }}
            >
              {data.personalInfo.name || "Your Name"}
            </h1>
            <div
              className="flex flex-wrap justify-center gap-4"
              style={{ color: `hsl(var(--cv-text-secondary))` }}
            >
              {data.personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}{" "}
              {data.personalInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}{" "}
              {data.personalInfo.linkedin && (
                <div className="flex items-center gap-1">
                  <Linkedin className="w-4 h-4" />
                  <a
                    href={data.personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 transition-opacity"
                    style={{ color: `hsl(var(--cv-text-secondary))` }}
                  >
                    LinkedIn
                  </a>
                </div>
              )}
              {data.personalInfo.github && (
                <div className="flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  <a
                    href={data.personalInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 transition-opacity"
                    style={{ color: `hsl(var(--cv-text-secondary))` }}
                  >
                    GitHub
                  </a>
                </div>
              )}
            </div>
          </div>{" "}
          {/* Professional Summary */}
          {data.summary && (
            <div className="mb-8">
              <h2
                className="text-2xl font-semibold pb-2 mb-4 flex items-center gap-2"
                style={{
                  borderBottom: `2px solid hsl(var(--cv-primary))`,
                  color: `hsl(var(--cv-primary))`,
                }}
              >
                <User className="w-5 h-5" />
                Professional Summary
              </h2>
              <p
                className="leading-relaxed"
                style={{ color: `hsl(var(--cv-text-secondary))` }}
              >
                {data.summary}
              </p>
            </div>
          )}{" "}
          {/* Experience */}
          {filteredExperience.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-2xl font-semibold pb-2 mb-4 flex items-center gap-2"
                style={{
                  borderBottom: `2px solid hsl(var(--cv-primary))`,
                  color: `hsl(var(--cv-primary))`,
                }}
              >
                <Briefcase className="w-5 h-5" />
                Experience
              </h2>
              <div className="space-y-6">
                {filteredExperience.map((exp, index) => (
                  <div
                    key={index}
                    className="pl-4 relative"
                    style={{ borderLeft: `2px solid hsl(var(--cv-accent))` }}
                  >
                    <div
                      className="absolute -left-2 top-0 w-4 h-4 rounded-full"
                      style={{ backgroundColor: `hsl(var(--cv-primary))` }}
                    ></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          className="text-xl font-semibold"
                          style={{ color: `hsl(var(--cv-text-primary))` }}
                        >
                          {exp.position || "Position"}
                        </h3>
                        <p
                          className="text-lg font-medium"
                          style={{ color: `hsl(var(--cv-text-secondary))` }}
                        >
                          {exp.company || "Company"}
                        </p>
                      </div>
                      <div
                        className="shrink-0 ml-2 px-2 py-1 rounded text-sm border"
                        style={{
                          borderColor: `hsl(var(--cv-accent))`,
                          color: `hsl(var(--cv-primary))`,
                          backgroundColor: `hsl(var(--cv-background))`,
                        }}
                      >
                        {exp.duration || "Duration"}
                      </div>
                    </div>
                    {exp.description && (
                      <p
                        className="leading-relaxed mt-2"
                        style={{ color: `hsl(var(--cv-text-secondary))` }}
                      >
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}{" "}
          {/* Education */}
          {filteredEducation.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-2xl font-semibold pb-2 mb-4 flex items-center gap-2"
                style={{
                  borderBottom: `2px solid hsl(var(--cv-primary))`,
                  color: `hsl(var(--cv-primary))`,
                }}
              >
                <GraduationCap className="w-5 h-5" />
                Education
              </h2>
              <div className="space-y-6">
                {filteredEducation.map((edu, index) => (
                  <div
                    key={index}
                    className="pl-4 relative"
                    style={{ borderLeft: `2px solid hsl(var(--cv-accent))` }}
                  >
                    <div
                      className="absolute -left-2 top-0 w-4 h-4 rounded-full"
                      style={{ backgroundColor: `hsl(var(--cv-primary))` }}
                    ></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          className="text-xl font-semibold"
                          style={{ color: `hsl(var(--cv-text-primary))` }}
                        >
                          {edu.degree || "Degree"}
                        </h3>
                        <p
                          className="text-lg font-medium"
                          style={{ color: `hsl(var(--cv-text-secondary))` }}
                        >
                          {edu.institution || "Institution"}
                        </p>
                      </div>
                      <div
                        className="shrink-0 ml-2 px-2 py-1 rounded text-sm border"
                        style={{
                          borderColor: `hsl(var(--cv-accent))`,
                          color: `hsl(var(--cv-primary))`,
                          backgroundColor: `hsl(var(--cv-background))`,
                        }}
                      >
                        {edu.year || "Year"}
                      </div>
                    </div>
                    {edu.description && (
                      <p
                        className="leading-relaxed mt-2"
                        style={{ color: `hsl(var(--cv-text-secondary))` }}
                      >
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}{" "}
          {/* Skills */}
          {filteredSkills.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-2xl font-semibold pb-2 mb-4 flex items-center gap-2"
                style={{
                  borderBottom: `2px solid hsl(var(--cv-primary))`,
                  color: `hsl(var(--cv-primary))`,
                }}
              >
                <Wrench className="w-5 h-5" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {filteredSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `hsl(var(--cv-primary))`,
                      color: `hsl(var(--cv-text-on-primary))`,
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}{" "}
          {/* Empty state */}
          {!data.personalInfo.name &&
            !data.summary &&
            filteredExperience.length === 0 &&
            filteredEducation.length === 0 &&
            filteredSkills.length === 0 && (
              <div className="text-center py-12">
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `hsl(var(--cv-accent) / 0.1)` }}
                >
                  <FileText
                    className="w-8 h-8"
                    style={{ color: `hsl(var(--cv-primary))` }}
                  />
                </div>
                <p
                  className="text-lg"
                  style={{ color: `hsl(var(--cv-text-secondary))` }}
                >
                  Start filling out the form to see your CV preview
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
