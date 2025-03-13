import React from 'react';

export interface PersonalInfo {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
}

export interface Project {
  name: string;
  description?: string;
  link?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  projects: Project[];
}

export interface ResumeTemplateProps {
  data: ResumeData;
}

const ProfessionalResumeTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {

  return (
    <div className="font-serif max-w-4xl mx-auto my-8 bg-white shadow-md overflow-hidden relative">
      <div id="professional-resume" className="p-8 bg-white">
        {/* Header Section */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{data.personalInfo.name || 'Your Name'}</h1>
          <h2 className="text-xl text-gray-700 mt-1">{data.personalInfo.title || 'Professional Title'}</h2>
          
          {/* Contact Info */}
          <div className="flex flex-wrap mt-4 text-sm text-gray-700">
            {data.personalInfo.email && (
              <div className="mr-6 mb-2">
                <span className="font-semibold">Email:</span> {data.personalInfo.email}
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="mr-6 mb-2">
                <span className="font-semibold">Phone:</span> {data.personalInfo.phone}
              </div>
            )}
            {data.personalInfo.location && (
              <div className="mr-6 mb-2">
                <span className="font-semibold">Location:</span> {data.personalInfo.location}
              </div>
            )}
            {data.personalInfo.linkedin && (
              <div className="mr-6 mb-2">
                <span className="font-semibold">LinkedIn:</span> {data.personalInfo.linkedin}
              </div>
            )}
            {data.personalInfo.website && (
              <div className="mr-6 mb-2">
                <span className="font-semibold">Website:</span> {data.personalInfo.website}
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        {data.summary && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase">Professional Summary</h3>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {data.workExperience && data.workExperience.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">Professional Experience</h3>
            
            {data.workExperience.map((job, index) => (
              <div key={index} className="mb-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                  <h4 className="text-base font-bold text-gray-800">{job.company}</h4>
                  <div className="text-sm text-gray-600 md:text-right mb-1 md:mb-0">
                    {job.startDate} - {job.endDate || 'Present'}
                  </div>
                </div>
                <div className="text-base text-gray-700 font-semibold italic mb-1">{job.title}</div>
                {job.description && <p className="text-gray-700">{job.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">Education</h3>
            
            {data.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                  <h4 className="text-base font-bold text-gray-800">{edu.institution}</h4>
                  <div className="text-sm text-gray-600 md:text-right mb-1 md:mb-0">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </div>
                </div>
                <div className="text-gray-700 italic">{edu.degree}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 md:pr-4">
            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">Skills</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {data.skills.map((skill, index) => (
                    <li key={index} className="mb-1">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="md:w-1/2 md:pl-4">
            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">Certifications</h3>
                
                {data.certifications.map((cert, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between">
                      <h4 className="text-base font-semibold text-gray-800">{cert.name}</h4>
                      {cert.date && <div className="text-sm text-gray-600">{cert.date}</div>}
                    </div>
                    {cert.issuer && <div className="text-gray-700">{cert.issuer}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">Projects</h3>
            
            {data.projects.map((project, index) => (
              <div key={index} className="mb-3">
                <h4 className="text-base font-semibold text-gray-800">
                  {project.link ? (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h4>
                {project.description && <p className="text-gray-700">Description : {project.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

     
    </div>
  );
};

export default ProfessionalResumeTemplate;