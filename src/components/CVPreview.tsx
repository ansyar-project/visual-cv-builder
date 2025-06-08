import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
} from "lucide-react";

interface CVPreviewProps {
  data: {
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
  };
}

export default function CVPreview({ data }: CVPreviewProps) {
  const filteredExperience = data.experience.filter(
    (exp) => exp.position || exp.company || exp.duration || exp.description
  );

  const filteredEducation = data.education.filter(
    (edu) => edu.degree || edu.institution || edu.year || edu.description
  );

  const filteredSkills = data.skills.filter((skill) => skill.trim());
  return (
    <div className="w-full max-w-full mx-auto">
      <Card className="h-full shadow-lg overflow-hidden">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="text-center border-b pb-6 mb-8">
            <h1 className="text-4xl font-bold mb-3">
              {data.personalInfo.name || "Your Name"}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-muted-foreground">
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
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {data.summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Professional Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {filteredExperience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Experience
              </h2>
              <div className="space-y-6">
                {filteredExperience.map((exp, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-muted pl-4 relative"
                  >
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {exp.position || "Position"}
                        </h3>
                        <p className="text-lg text-muted-foreground font-medium">
                          {exp.company || "Company"}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 ml-2">
                        {exp.duration || "Duration"}
                      </Badge>
                    </div>
                    {exp.description && (
                      <p className="text-muted-foreground leading-relaxed mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {filteredEducation.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </h2>
              <div className="space-y-6">
                {filteredEducation.map((edu, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-muted pl-4 relative"
                  >
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {edu.degree || "Degree"}
                        </h3>
                        <p className="text-lg text-muted-foreground font-medium">
                          {edu.institution || "Institution"}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 ml-2">
                        {edu.year || "Year"}
                      </Badge>
                    </div>
                    {edu.description && (
                      <p className="text-muted-foreground leading-relaxed mt-2">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {filteredSkills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {filteredSkills.map((skill, index) => (
                  <Badge key={index} variant="default" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!data.personalInfo.name &&
            !data.summary &&
            filteredExperience.length === 0 &&
            filteredEducation.length === 0 &&
            filteredSkills.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-lg">
                  Start filling out the form to see your CV preview
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
