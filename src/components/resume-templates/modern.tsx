"use client";
import React, { useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGlobe } from 'react-icons/fi';

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

declare global {
  interface Window {
    html2pdf: any;
  }
}

const ModernResumeTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  useEffect(() => {
    // Load html2pdf library if not already loaded
    if (typeof window !== 'undefined' && !window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const downloadAsPDF = () => {
    const resumeElement = document.getElementById('modern-resume');
    if (window && window.html2pdf && resumeElement) {
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${data.personalInfo.name?.replace(/\s+/g, '_') || 'Resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // Apply print-specific styling
      document.body.classList.add('printing');
      
      window.html2pdf().set(opt).from(resumeElement).save().then(() => {
        // Remove print-specific styling after PDF is generated
        document.body.classList.remove('printing');
      });
    } else {
      alert('PDF generation library is loading. Please try again in a moment.');
    }
  };

  return (
    <div className="font-sans w-full max-w-4xl mx-auto my-4 bg-white rounded-lg overflow-hidden print:shadow-none">
      {/* Paper effect container */}
      <div className="relative shadow-lg print:shadow-none border border-gray-200 rounded-lg">
        {/* Resume content - this is what gets exported to PDF */}
        <div id="modern-resume" className="p-6 md:p-8 bg-white">
          {/* Header Section */}
          <div className="border-b-2 border-blue-500 pb-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 break-words">{data.personalInfo.name || 'Your Name'}</h1>
           
            {/* Contact Info - more responsive layout */}
            <div className="flex flex-wrap items-start mt-4 text-gray-600">
              {data.personalInfo.email && (
                <div className="flex items-center mr-4 mb-2 w-full sm:w-auto">
                  <FiMail className="mr-2 flex-shrink-0 text-blue-500" />
                  <span className="text-sm break-all">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center mr-4 mb-2 w-full sm:w-auto">
                  <FiPhone className="mr-2 flex-shrink-0 text-blue-500" />
                  <span className="text-sm">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center mr-4 mb-2 w-full sm:w-auto">
                  <FiMapPin className="mr-2 flex-shrink-0 text-blue-500" />
                  <span className="text-sm">{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.linkedin && (
                <div className="flex items-center mr-4 mb-2 w-full sm:w-auto">
                  <FiLinkedin className="mr-2 flex-shrink-0 text-blue-500" />
                  <span className="text-sm break-all">{data.personalInfo.linkedin}</span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center mr-4 mb-2 w-full sm:w-auto">
                  <FiGlobe className="mr-2 flex-shrink-0 text-blue-500" />
                  <span className="text-sm break-all">{data.personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          {data.summary && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 border-l-4 border-blue-500 pl-2">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {data.workExperience && data.workExperience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Work Experience</h3>
              
              {data.workExperience.map((job, index) => (
                <div key={index} className="mb-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <h4 className="text-lg font-medium text-gray-800">{job.title}</h4>
                    <div className="text-sm text-gray-600 mt-1 sm:mt-0">
                      {job.startDate} - {job.endDate || 'Present'}
                    </div>
                  </div>
                  <div className="text-gray-700 font-medium mb-1">{job.company}</div>
                  {job.description && <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Two column layout for bottom sections - better responsive behavior */}
          <div className="grid grid-cols-1 md:grid-cols-1 md:gap-6">
            <div>
              {/* Education */}
              {data.education && data.education.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Education</h3>
                  
                  {data.education.map((edu, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <h4 className="text-lg font-medium text-gray-800">{edu.degree}</h4>
                        <div className="text-sm text-gray-600 mt-1 sm:mt-0">
                          {edu.startDate} - {edu.endDate || 'Present'}
                        </div>
                      </div>
                      <div className="text-gray-700">{edu.institution}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {data.certifications && data.certifications.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Certifications</h3>
                  
                  {data.certifications.map((cert, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <h4 className="text-md font-medium text-gray-800">{cert.name}</h4>
                        {cert.date && <div className="text-sm text-gray-600 mt-1 sm:mt-0">{cert.date}</div>}
                      </div>
                      {cert.issuer && <div className="text-gray-700 text-sm">{cert.issuer}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              {/* Skills */}
              {data.skills && data.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Skills</h3>
                  <div className="flex flex-wrap">
                    {data.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm mr-2 mb-2 transition-colors duration-200 hover:bg-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {data.projects && data.projects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Projects</h3>
                  
                  {data.projects.map((project, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="text-lg font-medium text-gray-800">
                        {project.link ? (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline transition-colors duration-200"
                          >
                            {project.name}
                          </a>
                        ) : (
                          project.name
                        )}
                      </h4>
                      {project.description && <p className="text-gray-600 text-sm leading-relaxed">Description : {project.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Download Button - improved styling and positioning */}
      <div className="mt-6 mb-8 text-center">
        <button 
          onClick={downloadAsPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Download PDF
        </button>
      </div>

      {/* Add global styles for printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #modern-resume, #modern-resume * {
            visibility: visible;
          }
          #modern-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        body.printing * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      `}</style>
    </div>
  );
};

export default ModernResumeTemplate;