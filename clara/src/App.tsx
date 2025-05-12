import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check local storage or system preference for initial dark mode setting
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    // Apply to document for Tailwind to pick up
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Effect to set initial theme and listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      const newMode = e.matches;
      setIsDarkMode(newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newMode);
    };

    // Initial setup
    document.documentElement.classList.toggle('dark', isDarkMode);

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleThemeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="relative w-full py-4 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* App Name */}
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">Clara</div>
          
          {/* Login/Signup and Theme Toggle Buttons */}
          <div className="flex space-x-4 items-center">
            <Button variant="outline" className="mr-2">Login</Button>
            <Button>Sign Up</Button>
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-yellow-500" />
              ) : (
                <Moon className="h-6 w-6 text-gray-800" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative flex-grow flex items-center justify-center">
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Meet Clara: Your Medical Companion
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Clara is an advanced AI-powered medical help bot designed to provide personalized health insights, 
            answer medical questions, and support your healthcare journey with accurate and compassionate information.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>

        {/* Background Dot Pattern */}
        <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
      <DotPattern
        glow={true}
        className={cn(
          "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
        )}
      />
      </div>
      </main>

      {/* Footer */}
      <footer className="relative py-6 px-6 text-center border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          © 2025 Clara. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;