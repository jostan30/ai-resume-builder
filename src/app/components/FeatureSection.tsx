'use client'
import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, FileCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";



export default function FeatureSection() {
   
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      };
    return (
        <>
        <section className="py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Let artificial intelligence do the heavy lifting while you focus on landing your dream job.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Generated Content",
                description: "Generate professional summaries, skill lists, and job descriptions with a single click.",
                icon: <Sparkles className="h-10 w-10 text-primary" />
              },
              {
                title: "Smart Feedback",
                description: "Receive real-time suggestions to improve your resume and make it stand out to employers.",
                icon: <FileCheck className="h-10 w-10 text-primary" />
              },
              {
                title: "Auto-Fill Sections",
                description: "Save time with AI that automatically fills in sections based on your job title and experience.",
                icon: <ArrowRight className="h-10 w-10 text-primary" />
              },
              {
                title: "Multiple Templates",
                description: "Choose from professionally designed templates that are ATS-friendly and recruiter-approved.",
                icon: <Sparkles className="h-10 w-10 text-primary" />
              },
              {
                title: "Easy Sharing",
                description: "Export your resume as a PDF or share via a unique link with potential employers.",
                icon: <Upload className="h-10 w-10 text-primary" />
              },
              {
                title: "Job-Specific Tailoring",
                description: "AI helps tailor your resume to specific job descriptions to increase your chances of success.",
                icon: <FileCheck className="h-10 w-10 text-primary" />
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        </>
    )
}