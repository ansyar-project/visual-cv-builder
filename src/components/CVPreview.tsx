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
    <div className="bg-white p-8 shadow-lg rounded-lg max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {data.personalInfo.name || "Your Name"}
        </h1>
        <div className="text-lg text-gray-600 space-x-4">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && (
            <span>• {data.personalInfo.location}</span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {filteredExperience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Experience
          </h2>
          {filteredExperience.map((exp, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {exp.position || "Position"}
                  </h3>
                  <p className="text-lg text-gray-600 italic">
                    {exp.company || "Company"}
                  </p>
                </div>
                <span className="text-gray-600 font-medium">
                  {exp.duration || "Duration"}
                </span>
              </div>
              {exp.description && (
                <p className="text-gray-700 leading-relaxed mt-2">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {filteredEducation.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Education
          </h2>
          {filteredEducation.map((edu, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {edu.degree || "Degree"}
                  </h3>
                  <p className="text-lg text-gray-600 italic">
                    {edu.institution || "Institution"}
                  </p>
                </div>
                <span className="text-gray-600 font-medium">
                  {edu.year || "Year"}
                </span>
              </div>
              {edu.description && (
                <p className="text-gray-700 leading-relaxed mt-2">
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {filteredSkills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Skills
          </h2>
          <div className="flex flex-wrap gap-3">
            {filteredSkills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
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
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">
              Start filling out the form to see your CV preview
            </p>
          </div>
        )}
    </div>
  );
}
