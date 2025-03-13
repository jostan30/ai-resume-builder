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

const MinimalResumeTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  
  return (
    <div className="font-sans max-w-3xl mx-auto my-8 bg-white shadow-sm overflow-hidden relative">
      <div id="minimal-resume" className="p-6 bg-white">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 uppercase tracking-wider">
            {data.personalInfo.name || 'Your Name'}
          </h1>
          {data.personalInfo.title && (
            <h2 className="text-lg text-gray-600 mt-1">{data.personalInfo.title}</h2>
          )}
          
          {/* Contact Info */}
          <div className="flex flex-wrap justify-center mt-4 text-sm text-gray-600">
            {data.personalInfo.email && (
              <span className="mx-2 mb-1">{data.personalInfo.email}</span>
            )}
            {data.personalInfo.phone && (
              <span className="mx-2 mb-1">{data.personalInfo.phone}</span>
            )}
            {data.personalInfo.location && (
              <span className="mx-2 mb-1">{data.personalInfo.location}</span>
            )}
            {data.personalInfo.linkedin && (
              <span className="mx-2 mb-1">{data.personalInfo.linkedin}</span>
            )}
            {data.personalInfo.website && (
              <span className="mx-2 mb-1">{data.personalInfo.website}</span>
            )}
          </div>
        </div>

        {/* Summary Section */}
        {data.summary && (
          <div className="mb-6">
            <h3 className="text-base font-medium uppercase tracking-wider text-gray-900 mb-2 border-b border-gray-200 pb-1">Summary</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {data.workExperience && data.workExperience.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-medium uppercase tracking-wider text-gray-900 mb-3 border-b border-gray-200 pb-1">Experience</h3>
            
            {data.workExperience.map((job, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-base font-medium text-gray-800">{job.title}</h4>
                  <div className="text-xs text-gray-600">
                    {job.startDate} - {job.endDate || 'Present'}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-1">{job.company}</div>
                {job.description && <p className="text-xs text-gray-600 leading-relaxed">{job.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-medium uppercase tracking-wider text-gray-900 mb-3 border-b border-gray-200 pb-1">Education</h3>
            
            {data.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-base font-medium text-gray-800">{edu.degree}</h4>
                  <div className="text-xs text-gray-600">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </div>
                </div>
                <div className="text-sm text-gray-700">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-medium uppercase tracking-wider text-gray-900 mb-3 border-b border-gray-200 pb-1">Skills</h3>
            <div className="text-sm text-gray-700">
              {data.skills.join(' • ')}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-medium uppercase tracking-wider text-gray-900 mb-3 border-b border-gray-200 pb-1">Certifications</h3>
            
            {data.certifications.map((cert, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-medium text-gray-800">{cert.name}</h4>
                  {cert.date && <div className="text-xs text-gray-600">{cert.date}</div>}
                </div>
                {cert.issuer && <div className="text-xs text-gray-700">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}


        {/* Projects */}
        {data.projects && data.projects.length > 0 &&   
        (
          <div className="mb-6">
            <h3 className="text-base font-medium uppercase tracking-wider text-gray-900 mb-3 border-b border-gray-200 pb-1">Projects</h3>
            
            {data.projects.map((project, index) => (
              <div key={index} className="mb-3">
                {project.name && <h4 className="text-sm font-bold text-gray-800 leading-relaxed">{project.name} </h4>}
                {
                  project.link && 
                  <a href={project.link} target="_blank" rel="noreferrer" className="text-xs text-gray-1000 hover:underline">
                  Link: {project.link}</a>
                }
                {project.description && <p className="text-xs text-gray-600 leading-relaxed">Description : {project.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MinimalResumeTemplate;