'use client'

import { motion} from "framer-motion";
import { ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function HeroSection({user }:{user:User | null } ) {
    const router = useRouter();
   
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

      const handleStartClick = () => {
        if (user) {
          router.push("/builder");
        } else {
          router.push("/signup");
        }
      };
      
  const handleUploadClick = () => {
    if (user) {
      // Will be implemented to handle file upload
      // For now, just redirect to builder
      router.push("/builder");
    } else {
      router.push("/signup");
    }
  };
    return (
        <>
        <section className="flex flex-col items-center justify-center text-center py-16 md:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-4xl"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Create Professional Resumes with <span className="text-primary">AI</span> in Minutes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered resume builder helps you craft standout resumes tailored to any job. 
              Get instant feedback, smart suggestions, and professional templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                size="lg" 
                onClick={handleStartClick}
                className="group"
              >
                Start with AI <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleUploadClick}
                className="group"
              >
                <Upload className="mr-2 h-4 w-4 group-hover:translate-y-[-2px] transition" /> Upload Existing Resume
              </Button>
            </div>
          </motion.div>
        </section>

        </>
    )
}