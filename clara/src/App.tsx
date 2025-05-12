import React, { useEffect } from 'react';
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Button } from '@/components/ui/button';
import { RippleButton } from "@/components/magicui/ripple-button";

const App: React.FC = () => {
  // Effect to set dark theme on mount
  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 transition-colors duration-300 relative font-sans">
      {/* Background Dot Pattern - Positioned to cover the entire screen */}
      <DotPattern
        width={25}
        height={25}
        cx={2}
        cy={2}
        cr={2}
        glow={true}
        className={cn(
          "absolute inset-0 w-full h-full z-0 text-blue-400/70",
          "[mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_95%)]",
        )}
      />
      
      {/* Navbar with blurred background */}
      <nav className="relative z-10 w-full py-4 px-6 border-b border-gray-800/50 bg-gradient-to-r from-black/80 via-black/85 to-black/80 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* App Name */}
          <div className="text-2xl font-bold text-gray-200">Clara</div>
          
          {/* Login/Signup Buttons */}
          <div className="flex space-x-4 items-center">
            <RippleButton 
              rippleColor="#ADD8E6" 
              className="py-2 px-4 mr-2 bg-transparent hover:bg-gray-800 text-gray-200 font-semibold border border-gray-700 rounded-lg"
            >
              Login
            </RippleButton>
            <RippleButton 
              rippleColor="#ADD8E6"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Sign Up
            </RippleButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-6">
            Meet Clara: Your Medical Companion
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Clara is an advanced AI-powered medical help bot designed to provide personalized health insights, 
            answer medical questions, and support your healthcare journey with accurate and compassionate information.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Learn More</Button>
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