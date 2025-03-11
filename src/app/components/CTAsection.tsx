import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {motion} from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection(user:{user:User |null}) {
    const router = useRouter();
  const handleStartClick = () => {
    if (user) {
      router.push("/builder");
    } else {
      router.push("/signup");
    }
  };
  
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
            transition={{ duration: 0.5 }}
            className="bg-primary/10 rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Professional Resume?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of job seekers who have successfully landed interviews with our AI-powered resume builder.
            </p>
            <Button size="lg" onClick={handleStartClick}>
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </section>
        </>
    )
}