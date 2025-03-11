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
import { useSupabase }  from "@/lib/useSupabase";
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

  // Fetch saved resume data
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
        
        if (data) {
          form.reset(data.content);
          toast("Resume loaded..", {
            description:` Your saved resume has been loaded.`,
          }) 
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
      }
    }
    
    fetchResumeData();
  }, []);

  // Auto-save to Supabase
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (!user) return;
      
      try {
        setIsSaving(true);
        const { error } = await supabase
          .from('resumes')
          .upsert({
            user_id: user.id,
            content: watchedValues,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        
        if (error) {
          console.error("Error saving resume:", error);
          toast.error("Error saving..", {
            description:` There was an error saving your resume.`,
          }) 
          
        }
      } catch (error) {
        console.error("Error saving resume:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1500);
    
    return () => clearTimeout(debounce);
  }, []);

  // Generate AI feedback
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
  }, []);

  // Generate AI content for a specific section
  const generateAiContent = async (section: string, context: any) => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be replaced with actual AI API calls
      switch (section) {
        case "summary":
          const jobTitle = context?.jobTitle || watchedValues.workExperience[0]?.title || "";
          if (jobTitle) {
            form.setValue("summary", `Experienced ${jobTitle} with a proven track record of delivering high-quality results. Skilled in collaboration, problem-solving, and adapting to new technologies. Passionate about creating innovative solutions that drive business growth while maintaining excellence in technical implementation.`);
            toast("Summary generated..", {
                description:` AI has generated a summary based on your job title`,
              })   
          } else {
            toast.error("Information needed",{
              description: "Please add a job title to generate a relevant summary.",
            });
          }
          break;
          
        case "skills":
          const role = context?.role || watchedValues.workExperience[0]?.title || "";
          if (role) {
            if (role.toLowerCase().includes("developer") || role.toLowerCase().includes("engineer")) {
              form.setValue("skills", ["JavaScript", "TypeScript", "React", "Node.js", "CSS", "HTML", "Git", "REST APIs", "Problem Solving", "Team Collaboration"]);
            } else if (role.toLowerCase().includes("designer")) {
              form.setValue("skills", ["UI/UX Design", "Figma", "Adobe Creative Suite", "Prototyping", "Wireframing", "User Research", "Design Systems", "Typography", "Color Theory", "Responsive Design"]);
            } else if (role.toLowerCase().includes("manager")) {
              form.setValue("skills", ["Team Leadership", "Project Management", "Strategic Planning", "Stakeholder Management", "Budgeting", "Agile Methodologies", "Performance Evaluation", "Conflict Resolution", "Communication", "Decision Making"]);
            } else {
              form.setValue("skills", ["Communication", "Problem Solving", "Team Collaboration", "Time Management", "Project Management", "Adaptability", "Analytical Thinking", "Attention to Detail"]);
            }
            toast("Skills generated..", {
                description:` AI has suggested skills based on ${role} role.`,
              })
          } else {
            toast.error("Information needed",{
                description: "Please add a job title to generate relevant skills.",
                })
          
          }
          break;
          
        case "workExperience":
          const index = context?.index || 0;
          const job = form.getValues().workExperience[index];
          
          if (job?.title && job?.company) {
            let newDescription = "";
            if (job.title.toLowerCase().includes("developer") || job.title.toLowerCase().includes("engineer")) {
              newDescription = `• Developed and maintained web applications using modern JavaScript frameworks, resulting in a 30% increase in user engagement.\n• Collaborated with cross-functional teams to implement new features and resolve complex technical issues.\n• Optimized application performance, reducing page load times by 40%.\n• Participated in code reviews and mentored junior developers.`;
            } else if (job.title.toLowerCase().includes("designer")) {
              newDescription = `• Created user-centered designs for web and mobile applications that increased user satisfaction by 25%.\n• Conducted user research and usability testing to inform design decisions.\n• Developed responsive design systems that ensured consistency across multiple platforms.\n• Collaborated with developers to ensure high-quality implementation of designs.`;
            } else if (job.title.toLowerCase().includes("manager")) {
              newDescription = `• Led a team of 8 professionals, providing mentorship and guidance to achieve departmental goals.\n• Managed project timelines and resources, delivering 95% of projects on time and within budget.\n• Developed strategic plans that aligned with company objectives and increased revenue by 20%.\n• Fostered a collaborative team environment that improved employee retention by 15%.`;
            } else {
              newDescription = `• Executed key responsibilities that contributed to team and organizational success.\n• Collaborated with cross-functional teams to achieve shared objectives.\n• Implemented process improvements that increased efficiency by 15%.\n• Received recognition for outstanding performance and contributions.`;
            }
            
            form.setValue(`workExperience.${index}.description`, newDescription);
            toast("Description generated...", {
                description:` AI has generated a description for ${job.title} at ${job.company}.`,
              })
           
          } else {
            toast.error("Information needed",{ 
                description: "Please add a job title and company to generate a description.",
              })
            
          }
          break;
          
        default:
          toast("Feature not available",{
            description: "AI generation for this section is not available yet.",
          });
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast.error( "Generation failed",{   
        description: "There was an error generating AI content.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-fill entire resume with AI
  const autoFillResume = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would be replaced with actual Hugging Face API calls
      form.reset({
        personalInfo: {
          name: "Alex Johnson",
          email: "alex.johnson@example.com",
          phone: "(555) 123-4567",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/alexjohnson",
          website: "alexjohnson.dev",
        },
        summary: "Innovative Full Stack Developer with 5+ years of experience building scalable web applications and services. Passionate about creating intuitive user experiences and optimizing application performance. Skilled in React, Node.js, and cloud architecture with a strong focus on code quality and best practices.",
        skills: [
          "JavaScript", "TypeScript", "React", "Node.js", 
          "Express", "MongoDB", "PostgreSQL", "AWS", 
          "Docker", "CI/CD", "REST APIs", "GraphQL"
        ],
        workExperience: [
          {
            title: "Senior Full Stack Developer",
            company: "TechInnovate Solutions",
            location: "San Francisco, CA",
            startDate: "2022-01",
            endDate: "",
            current: true,
            description: "• Led development of a microservices architecture that improved scalability by 200%.\n• Architected and implemented a React-based frontend that reduced load times by 40%.\n• Mentored junior developers and established code review processes that reduced bugs by 30%.\n• Collaborated with product and design teams to deliver features that increased user engagement by 25%.",
          },
          {
            title: "Full Stack Developer",
            company: "WebSphere Inc.",
            location: "Oakland, CA",
            startDate: "2019-03",
            endDate: "2021-12",
            current: false,
            description: "• Developed and maintained RESTful APIs that powered mobile and web applications.\n• Implemented authentication and authorization systems that enhanced security.\n• Created responsive web interfaces using React and modern CSS techniques.\n• Optimized database queries that improved application performance by 35%.",
          },
        ],
        education: [
          {
            degree: "BSc in Computer Science",
            institution: "University of California, Berkeley",
            location: "Berkeley, CA",
            startDate: "2015-09",
            endDate: "2019-05",
            description: "Graduated with honors. Specialized in software engineering and artificial intelligence.",
          },
        ],
        projects: [
          {
            name: "E-commerce Platform",
            description: "Built a full-stack e-commerce platform using React, Node.js, and MongoDB. Implemented features including user authentication, product catalog, shopping cart, and payment processing.",
            link: "github.com/alexj/ecommerce-platform",
            technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
          },
          {
            name: "Task Management App",
            description: "Developed a collaborative task management application with real-time updates using Socket.io, React, and Express. Features include drag-and-drop interfaces, task assignments, and progress tracking.",
            link: "taskapp.alexjohnson.dev",
            technologies: ["React", "Express", "Socket.io", "PostgreSQL"],
          },
        ],
        certifications: [
          {
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2022-05",
            description: "Validated expertise in designing and deploying scalable systems on AWS.",
          },
          {
            name: "Professional Scrum Master I",
            issuer: "Scrum.org",
            date: "2021-02",
            description: "Certified in Scrum methodologies and agile project management.",
          },
        ],
      });
      
      toast("Resume auto-filled",{
        description: "AI has generated a complete resume draft. You can edit and customize it as needed.",
      });
    } catch (error) {
      console.error("Error auto-filling resume:", error);
      toast.error("Auto-fill failed",{
        description: "There was an error generating your resume.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof resumeFormSchema>) => {
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
          onClick={() => generateAiContent("summary", { jobTitle: form.getValues().workExperience[0]?.title })}
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
            onClick={() => generateAiContent("skills", { role: form.getValues().workExperience[0]?.title })}
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
              onClick={() => generateAiContent("workExperience", { index })}
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
              variant="outline"
              onClick={autoFillResume}
              disabled={isGenerating}
              className="flex items-center gap-1"
            >
              {isGenerating ? "Generating..." : "Auto-Fill with AI"}
              <Wand2 className="h-4 w-4 ml-1" />
            </Button>
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