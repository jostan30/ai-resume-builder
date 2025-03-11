'use client'

import { useAuth } from "@/providers/useAuth";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import CTASection from "./components/CTAsection";

export default function Home() {

  const { user } = useAuth();

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
