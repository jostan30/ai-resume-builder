// eslint-disable @typescript-eslint/no-explicit-any

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthCheck from "@/providers/authprovider";
import { useSupabase } from "@/lib/useSupabase";
import { toast } from "sonner";
import { Download, ArrowLeft, Edit, Check } from "lucide-react";
import { motion } from "framer-motion";

// Resume template components
import ModernTemplate from "@/components/resume-templates/modern";
import MinimalTemplate from "@/components/resume-templates/minimal";
import ProfessionalTemplate from "@/components/resume-templates/professional";
import domtoimage from "dom-to-image-more";
import { saveAs } from "file-saver";

export default function ResumePreview() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [resumeData, setResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");


  // Fetch resume data from Supabase
  useEffect(() => {
    async function fetchResumeData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching resume:", error);
          toast.error("Error",{
            description: "Could not load resume data. Please try again.",
          });
          return;
        }
        
        if (data) {
          setResumeData(data.content);
          // Generate AI summary
          generateAiSummary(data.content);
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchResumeData();
  }, [user, supabase, toast]);

  // Generate AI summary of the resume
  const generateAiSummary = async (data:any) => {
    // Simulate AI processing
    setTimeout(() => {
      if (!data) return;
      
      const name = data.personalInfo?.name || "The candidate";
      const role = data.workExperience?.[0]?.title || "professional";
      const experience = data.workExperience?.length || 0;
      const education = data.education?.[0]?.degree || "relevant education";
      const skills = data.skills?.slice(0, 3).join(", ") || "various skills";
      
      const summary = `${name} is a ${role} with ${experience} work experiences and ${education}. Their resume highlights ${skills}, making them a strong candidate for similar roles.`;
      
      setAiSummary(summary);
    }, 1000);
  };

  const exportToPdf = async () => {
    const resumeElement = document.getElementById("resume-preview");
    if (!resumeElement) {
      toast("Error", { description: "Could not find resume to export." });
      return;
    }
  
    try {
      toast("Exporting Image", { description: "Your resume is being prepared for download." });
  
      const blob = await domtoimage.toBlob(resumeElement);
      saveAs(blob, "resume.png");
  
      toast("Export Successful", { description: "Your resume has been saved as an image." });
    } catch (error) {
      console.error("Error exporting image:", error);
      toast("Error", { description: "An error occurred while exporting the resume." });
    }
  };

  // Determine which template to render
  const renderSelectedTemplate = () => {
    if (!resumeData) return null;
    
    switch (selectedTemplate) {
      case "modern":
        return <ModernTemplate data={resumeData} />;
      case "minimal":
        return <MinimalTemplate data={resumeData} />;
      case "professional":
        return <ProfessionalTemplate data={resumeData} />;
      default:
        return <ModernTemplate data={resumeData} />;
    }
  };

  return (
    <AuthCheck>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/builder")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Resume Preview</h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground whitespace-nowrap">Template:</p>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/builder")}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit Resume
              </Button>
             
              <Button 
                onClick={exportToPdf}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4 mr-1" /> Export PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-lg p-8 min-h-[1000px] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded mb-8"></div>
                  <div className="h-64 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded mt-8"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mt-4"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mt-2"></div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="resume-preview-container" id="resume-preview">
                  {renderSelectedTemplate()}
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">AI Resume Summary</h2>
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{aiSummary}</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Resume Tips</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Keep your resume to one page for best results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Use active voice and strong action verbs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Quantify achievements with numbers when possible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Tailor your resume for each job application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Proofread carefully for typos and grammatical errors</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">ATS Optimization</h2>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">ATS Compatibility</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-4">
                      Your resume is optimized for Applicant Tracking Systems. Consider adding more
                      industry-specific keywords to increase your visibility.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}