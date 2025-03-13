/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AuthCheck from "@/providers/authprovider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wand2, AlertCircle, Trash, Plus, ArrowRight } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { motion, AnimatePresence } from "framer-motion";


// Resume form schema
const resumeFormSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }),
  summary: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  workExperience: z.array(z.object({
    title: z.string().min(1, "Job title is required"),
    company: z.string().min(1, "Company name is required"),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().optional(),
  })),
  education: z.array(z.object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution name is required"),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })),
  projects: z.array(z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    link: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  })),
  certifications: z.array(z.object({
    name: z.string().min(1, "Certification name is required"),
    issuer: z.string().optional(),
    date: z.string().optional(),
    description: z.string().optional(),
  })),
});

export default function ResumeBuilder() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [aiFeedback, setAiFeedback] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { supabase, user } = useSupabase();

  // Initialize form
  const form = useForm<z.infer<typeof resumeFormSchema>>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        website: "",
      },
      summary: "",
      skills: [],
      workExperience: [
        {
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
      education: [
        {
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      projects: [],
      certifications: [],
    },
  });

  // Watch form values for auto-save and AI feedback
  const watchedValues = form.watch();

  // // // Fetch saved resume data
  useEffect(() => {
    async function fetchResumeData() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching resume:", error);
          return;
        }

        if (data?.content) {
          form.reset(data.content);
          toast("Resume loaded..", {
            description: ` Your saved resume has been loaded.`,
          })
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
      }
    }

    fetchResumeData();
  }, [user]);

  // Auto-save to Supabase
  const saveResume = async () => {
    if (!user || !user.id) {
      console.error("User ID is missing:", user);
      return;
    }
    console.log("watchedValues:", watchedValues);
  
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("resumes")
        .upsert(
          [
            {
              user_id: user.id,
              content: watchedValues, // Remove JSON.stringify()
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "user_id" } // Ensure 'user_id' is UNIQUE in Supabase
        );
  
      if (error) {
        console.error("Error saving resume:", error.message || error);
      } else {
        console.log("Resume saved successfully.");
      }
    } catch (error) {
      console.error("Unexpected error saving resume:", error);
    } finally {
      setIsSaving(false);
    }
  };
  

  // // Generate AI feedback
  useEffect(() => {
    const generateAiFeedback = () => {
      // Simulate AI feedback (would be replaced with actual AI API calls)
      const feedback = [];

      // Check personal info completeness
      if (!watchedValues.personalInfo.linkedin) {
        feedback.push("Adding a LinkedIn profile can strengthen your professional presence.");
      }

      // Check summary length
      if (watchedValues.summary && watchedValues.summary.length < 200) {
        feedback.push("Your summary is quite brief. Consider expanding it to highlight your key strengths.");
      }

      // Check skills count
      if (watchedValues.skills.length < 5) {
        feedback.push("Adding more skills relevant to your target job can improve your resume.");
      }

      // Check work experience descriptions
      const hasEmptyJobDescriptions = watchedValues.workExperience.some(
        job => job.title && job.company && (!job.description || job.description.length < 50)
      );
      if (hasEmptyJobDescriptions) {
        feedback.push("Add detailed job descriptions with accomplishments and metrics for better impact.");
      }

      setAiFeedback(feedback);
    };

    const debounce = setTimeout(generateAiFeedback, 2000);
    return () => clearTimeout(debounce);
  }, [watchedValues]);

// Generate AI content for a specific section
const generateAiContent = async (section: string) => {
  setIsGenerating(true);

  try {
    const jobTitle = form.getValues().workExperience[0]?.title;
    const payload = JSON.stringify({ section, jobTitle });
    console.log("Request Payload:", payload);

    // Update the URL to match your deployed backend
    const API_URL = "http://localhost:8000";
    
    const response = await fetch(`${API_URL}/api/generate-ai-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Received Data:", data);

    if (data.error) {
      toast.error("Generation failed", { description: data.error });
      return;
    }

    // Update form fields based on response
    if (section === "summary" && data.summary) {
      form.setValue("summary", data.summary);
      toast.success("Summary generated", {
        description: `AI-generated summary for ${jobTitle || "your profile"}.`,
      });
    } else if (section === "skills" && data.skills) {
      // Set the skills array in the form
      form.setValue("skills", data.skills);
      toast.success("Skills generated", {
        description: `${data.skills.length} AI-suggested skills for ${jobTitle || "this role"}.`,
      });
    } else {
      toast.error("Unexpected response format", {
        description: "AI response did not contain expected data.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Generation failed", {
      description: "Error generating AI content. Please try again.",
    });
  } finally {
    setIsGenerating(false);
  }
};

  


  // Handle form submission
  const onSubmit = async (data: z.infer<typeof resumeFormSchema>) => {
    await saveResume();
    router.push("/preview");
  };

  // Add item to array fields
  const addItem = (field: string) => {
    switch (field) {
      case "workExperience":
        form.setValue("workExperience", [
          ...form.getValues().workExperience,
          {
            title: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
          },
        ]);
        break;
      case "education":
        form.setValue("education", [
          ...form.getValues().education,
          {
            degree: "",
            institution: "",
            location: "",
            startDate: "",
            endDate: "",
            description: "",
          },
        ]);
        break;
      case "projects":
        form.setValue("projects", [
          ...form.getValues().projects,
          {
            name: "",
            description: "",
            link: "",
            technologies: [],
          },
        ]);
        break;
      case "certifications":
        form.setValue("certifications", [
          ...form.getValues().certifications,
          {
            name: "",
            issuer: "",
            date: "",
            description: "",
          },
        ]);
        break;
      case "skills":
        form.setValue("skills", [...form.getValues().skills, ""]);
        break;
    }
  };

  // Remove item from array fields
  const removeItem = (field: keyof z.infer<typeof resumeFormSchema>, index: number) => {
    const currentItems = form.getValues()[field] as any[];
    if (currentItems.length <= 1) return;

    form.setValue(
      field,
      currentItems.filter((_, i) => i !== index)
    );
  };

  // Form sections UI
  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="personalInfo.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="Jane Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalInfo.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jane.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personalInfo.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="personalInfo.location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="San Francisco, CA" {...field} />
            </FormControl>
            <FormDescription>City, State or Country</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalInfo.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn</FormLabel>
              <FormControl>
                <Input placeholder="linkedin.com/in/janedoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personalInfo.website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="janedoe.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-lg font-medium">Professional Summary</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => generateAiContent("summary")}
          disabled={isGenerating}
          className="flex items-center gap-1"
        >
          {isGenerating ? "Generating..." : "Generate with AI"}
          <Wand2 className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <FormField
        control={form.control}
        name="summary"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="A brief overview of your professional background and key strengths..."
                className="min-h-32"
                {...field}
              />
            </FormControl>
            <FormDescription>
              A compelling summary highlights your value proposition to employers.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-lg font-medium">Skills</FormLabel>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem("skills")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Skill
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => generateAiContent("skills")}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Suggest Skills"}
            <Wand2 className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {form.getValues().skills.map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name={`skills.${index}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="e.g., JavaScript, Project Management" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem("skills", index)}
              className="h-10 w-10"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorkExperience = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FormLabel className="text-lg font-medium">Work Experience</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addItem("workExperience")}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Position
        </Button>
      </div>

      {form.getValues().workExperience.map((_, index) => (
        <Card key={index} className="p-4 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem("workExperience", index)}
            className="absolute top-2 right-2 h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name={`workExperience.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`workExperience.${index}.company`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`workExperience.${index}.location`}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name={`workExperience.${index}.startDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`workExperience.${index}.endDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="month"
                      disabled={form.getValues().workExperience[index]?.current}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`workExperience.${index}.current`}
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0 mb-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <FormLabel>I currently work here</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between mb-2">
            <FormLabel>Job Description</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateAiContent("workExperience")}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate with AI"}
              <Wand2 className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <FormField
            control={form.control}
            name={`workExperience.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describe your responsibilities, achievements, and key contributions..."
                    className="min-h-28"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Use bullet points and metrics to highlight achievements.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FormLabel className="text-lg font-medium">Education</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addItem("education")}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Education
        </Button>
      </div>

      {form.getValues().education.map((_, index) => (
        <Card key={index} className="p-4 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem("education", index)}
            className="absolute top-2 right-2 h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name={`education.${index}.degree`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="BS in Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`education.${index}.institution`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <FormControl>
                    <Input placeholder="University of California, Berkeley" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`education.${index}.location`}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Berkeley, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name={`education.${index}.startDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`education.${index}.endDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`education.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Honors, relevant coursework, activities, etc."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      ))}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FormLabel className="text-lg font-medium">Projects</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addItem("projects")}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Project
        </Button>
      </div>

      {form.getValues().projects.map((_, index) => (
        <Card key={index} className="p-4 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem("projects", index)}
            className="absolute top-2 right-2 h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>

          <FormField
            control={form.control}
            name={`projects.${index}.name`}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="E-commerce Platform" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`projects.${index}.link`}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Project Link</FormLabel>
                <FormControl>
                  <Input placeholder="github.com/username/project" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`projects.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the project, your role, technologies used, and outcomes..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      ))}
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FormLabel className="text-lg font-medium">Certifications</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addItem("certifications")}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Certification
        </Button>
      </div>

      {form.getValues().certifications.map((_, index) => (
        <Card key={index} className="p-4 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem("certifications", index)}
            className="absolute top-2 right-2 h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name={`certifications.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification Name</FormLabel>
                  <FormControl>
                    <Input placeholder="AWS Certified Solutions Architect" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`certifications.${index}.issuer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issuing Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="Amazon Web Services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`certifications.${index}.date`}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Date Acquired</FormLabel>
                <FormControl>
                  <Input type="month" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`certifications.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of the certification and its relevance..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      ))}
    </div>
  );

  return (
    <AuthCheck>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Resume Builder</h1>
            <p className="text-muted-foreground">
              {isSaving && "Saving..."}
              {!isSaving && "Create your professional resume with AI assistance"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="flex items-center gap-1"
            >
              Preview Resume <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mb-8">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="extras">Extras</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-8">
                    {renderPersonalInfo()}
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-8">
                    {renderSummary()}
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-8">
                    {renderSkills()}
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-8">
                    {renderWorkExperience()}
                  </TabsContent>

                  <TabsContent value="education" className="space-y-8">
                    {renderEducation()}
                  </TabsContent>

                  <TabsContent value="extras" className="space-y-8">
                    <div className="space-y-8">
                      {renderProjects()}
                      <Separator className="my-8" />
                      {renderCertifications()}
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiFeedback.length > 0 ? (
                  <ul className="space-y-2">
                    <AnimatePresence>
                      {aiFeedback.map((feedback, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-sm flex items-start gap-2"
                        >
                          <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                            <AlertCircle className="h-3 w-3 text-primary" />
                          </div>
                          <span>{feedback}</span>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your resume looks good! Continue adding information to get more AI feedback.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}


  // Auto-fill entire resume with AI
  // const autoFillResume = async () => {
  //   setIsGenerating(true);

  //   try {
  //     const send = JSON.stringify({
  //       job_title: form.getValues().workExperience[0]?.title,
  //       skills: form.getValues().skills,
  //     });
  //     console.log(send);
      
  //     // Simulate AI generation delay
  //     const response = await fetch("http://127.0.0.1:8000/generate-resume", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body:send,
  //     })

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch AI-generated resume");
  //     }

  //     const data = await response.json();
  //     console.log("AI-generated resume:", data);
  //     form.reset(data.resume);

  //     toast("Resume auto-filled", {
  //       description: "AI has generated a complete resume draft. You can edit and customize it as needed.",
  //     });
  //   } catch (error) {
  //     console.error("Error auto-filling resume:", error);
  //     toast.error("Auto-fill failed", {
  //       description: "There was an error generating your resume.",
  //     });
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };