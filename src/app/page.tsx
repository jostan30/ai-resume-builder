'use client'

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/useAuth";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import CTASection from "./components/CTAsection";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();


  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <main>
        {/* Hero section */}
        <HeroSection user={user}  />

        {/* Features section */}
        <FeatureSection/>

        {/* CTA section */}
        <CTASection user= {user}/>
        
      </main>

    </div>
  );
}
