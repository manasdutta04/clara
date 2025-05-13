import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { RippleButton } from "@/components/magicui/ripple-button";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { ShinyButton } from "@/components/magicui/shiny-button";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { TextReveal } from "@/components/magicui/text-reveal";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import Footer from "@/components/footer";
import { ArrowRight } from 'lucide-react';
import AuthPage from '@/pages/auth/AuthPage';
import '@/styles/globals.css';
import MultilingualSupport from './pages/MultilingualSupport';
import MedicalHistory from './pages/MedicalHistory';
import LabReportAnalysis from './pages/LabReportAnalysis';
import AiDiagnosis from './pages/AiDiagnosis';
import MentalHealthChatbot from './pages/MentalHealthChatbot';
    
// HomePage component (formerly the App content)
const HomePage: React.FC = () => {
  const textRevealRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (!textRevealRef.current) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionTop = textRevealRef.current.getBoundingClientRect().top + scrollY;
      const sectionHeight = textRevealRef.current.offsetHeight;
      
      // Calculate when the section should start and end being sticky
      const startSticky = sectionTop - windowHeight;
      const endSticky = sectionTop + windowHeight;

      // Set sticky state based on scroll position
      setIsSticky(scrollY >= startSticky && scrollY <= endSticky);
    };
    
    window.addEventListener('scroll', handleScroll);

    // Initial call to set position correctly
    setTimeout(() => {
      handleScroll();
    }, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen w-screen overflow-x-hidden flex flex-col bg-black text-gray-100 transition-colors duration-300 relative font-sans">
      {/* Interactive Grid Pattern Background */}
      <InteractiveGridPattern
        className={cn(
          "absolute inset-0 w-full h-full z-0",
          "[mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_95%)]",
        )}
        count={100}
        pointColor="rgb(255, 255, 255)"
        lineColor="rgba(79, 122, 158, 0.24)"
        pointSize={1.5}
        pointDuration={3000}
        cursorEffect={150}
      />
      
      {/* Navbar with blurred background - reduced height */}
      <nav className="relative z-10 w-full py-2 px-4 border-b border-gray-800/50 bg-gradient-to-r from-black/80 via-black/85 to-black/80 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* App Name */}
          <div className="text-xl font-bold text-gray-200">Clara</div>
          
          {/* Login/Signup Buttons */}
          <div className="flex space-x-2 items-center">
            <Link to="/auth">
              <RippleButton 
                rippleColor="#ADD8E6" 
                className="py-1 px-3 text-sm bg-transparent hover:bg-gray-800 text-gray-200 font-medium rounded-lg"
              >
                Log in
              </RippleButton>
            </Link>
            <Link to="/auth?mode=signup">
              <RippleButton 
                rippleColor="#ADD8E6"
                className="py-1.5 px-4 text-sm bg-white hover:bg-gray-100 text-black font-medium rounded-full"
              >
                Sign up
              </RippleButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center pt-10 w-full overflow-x-hidden">
        {/* Floating Badge with Shiny Effect */}
        <ShinyButton className="mb-6 bg-gray-950 border border-gray-800/50 rounded-full px-4 py-1.5 text-gray-400 text-sm">
          <span className="mr-2 text-amber-500">✨</span>
          <span className="font-medium">Introducing Clara</span>
          <ArrowRight className="ml-2 h-3 w-3 inline" />
        </ShinyButton>
        
        <div className="text-center w-full max-w-4xl mx-auto px-4">
          <h1 className="tracking-tighter leading-tight mb-8">
            <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold block mb-2 text-white">Clara</span>
            <span className="text-4xl sm:text-5xl md:text-6xl font-medium block bg-gradient-to-r from-white via-blue-300 to-blue-500 text-transparent bg-clip-text animate-gradient-x bg-300%">your health buddy.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Beautifully designed, intelligent AI medical companion built with
            <br className="hidden md:block" />
            modern technology to provide personalized health insights.
          </p>
          <div className="flex justify-center items-center">
            <Link to="/auth?mode=signup">
              <PulsatingButton className="inline-flex items-center whitespace-nowrap">
                <span>Get Started for free</span>
                <ArrowRight className="ml-1.5 h-3 w-3 inline" />
              </PulsatingButton>
            </Link>
          </div>
        </div>

        {/* Magic UI Text Reveal Section */}
        <div className="w-full" ref={textRevealRef}>
          <div className="h-[50vh]"></div> {/* Increased spacer before animation starts */}
          
          <TextReveal className="h-[30vh] text-white">
            <span className="text-5xl md:text-6xl lg:text-7xl font-bold whitespace-nowrap">
              Meet Clara, an AI powered medical companion.
            </span>
          </TextReveal>
          
          <TextReveal className="h-[30vh]">
            <span className="text-xl md:text-2xl lg:text-3xl text-blue-300">
              Understand Your Health. Feel Better, Sooner.
            </span>
          </TextReveal>
          
          <div className="h-[30vh]"></div> {/* Spacer after animation ends */}
      </div>

        {/* Features Section */}
        <FeaturesSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

const App: React.FC = () => {
  // Effect to set dark theme on mount
  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/language" element={<MultilingualSupport />} />
        <Route path="/medical-history" element={<MedicalHistory />} />
        <Route path="/lab-report-analysis" element={<LabReportAnalysis />} />
        <Route path="/ai-diagnosis" element={<AiDiagnosis />} />
        <Route path="/mental-health-chatbot" element={<MentalHealthChatbot />} />
      </Routes>
    </Router>
  );
}

export default App;