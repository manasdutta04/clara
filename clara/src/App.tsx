import React, { useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { RippleButton } from "@/components/magicui/ripple-button";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { ShinyButton } from "@/components/magicui/shiny-button";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  // Effect to set dark theme on mount
  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 transition-colors duration-300 relative font-sans">
      {/* Interactive Grid Pattern Background */}
      <InteractiveGridPattern
        className={cn(
          "absolute inset-0 w-full h-full z-0",
          "[mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_95%)]",
        )}
        count={50}
        pointColor="rgba(66, 153, 225, 0.6)" // blue-400 with opacity
        lineColor="rgba(66, 153, 225, 0.3)" // blue-400 with less opacity
        pointSize={2}
        pointDuration={3000}
        cursorEffect={200}
      />
      
      {/* Navbar with blurred background - reduced height */}
      <nav className="relative z-10 w-full py-2 px-4 border-b border-gray-800/50 bg-gradient-to-r from-black/80 via-black/85 to-black/80 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* App Name */}
          <div className="text-xl font-bold text-gray-200">Clara</div>
          
          {/* Login/Signup Buttons */}
          <div className="flex space-x-2 items-center">
            <RippleButton 
              rippleColor="#ADD8E6" 
              className="py-1 px-3 text-sm bg-transparent hover:bg-gray-800 text-gray-200 font-medium rounded-lg"
            >
              Log in
            </RippleButton>
            <RippleButton 
              rippleColor="#ADD8E6"
              className="py-1.5 px-4 text-sm bg-white hover:bg-gray-100 text-black font-medium rounded-full"
            >
              Sign up
            </RippleButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center pt-10">
        {/* Floating Badge with Shiny Effect */}
        <ShinyButton className="mb-6 bg-gray-950 border border-gray-800/50 rounded-full px-4 py-1.5 text-gray-400 text-sm">
          <span className="mr-2 text-amber-500">✨</span>
          <span className="font-medium">Introducing Clara</span>
          <ArrowRight className="ml-2 h-3 w-3 inline" />
        </ShinyButton>
        
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="tracking-tighter leading-tight mb-8">
            <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold block mb-2 text-white">Clara</span>
            <span className="text-4xl sm:text-5xl md:text-6xl font-medium block bg-gradient-to-r from-white via-blue-300 to-blue-500 text-transparent bg-clip-text animate-gradient-x bg-300%">your health buddy.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Beautifully designed, intelligent AI medical companion built with
            <br className="hidden md:block" />
            modern technology to provide personalized health insights.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <PulsatingButton className="inline-flex items-center whitespace-nowrap">
              <span>Get Started for free</span>
              <ArrowRight className="ml-1.5 h-3 w-3 inline" />
            </PulsatingButton>
          </div>
        </div>
      </main>

      {/* Footer with blurred background */}
      <footer className="relative z-10 py-6 px-6 text-center border-t border-gray-800/50 bg-gradient-to-r from-black/80 via-black/85 to-black/80 backdrop-blur-xl">
        <p className="text-gray-500">
          © 2025 Clara. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;