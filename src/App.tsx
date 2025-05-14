import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { RippleButton } from "@/components/magicui/ripple-button";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { ShinyButton } from "@/components/magicui/shiny-button";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { TextReveal } from "@/components/magicui/text-reveal";
import { CoolMode } from "@/components/magicui/cool-mode";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import Footer from "@/components/footer";
import { ArrowRight } from 'lucide-react';
import AuthPage from '@/pages/auth/AuthPage';
import '@/styles/globals.css';
import MedicalHistory from './pages/MedicalHistory';
import LabReportAnalysis from './pages/LabReportAnalysis';
import AiDiagnosis from './pages/AiDiagnosis';
import MentalHealthChatbot from './pages/MentalHealthChatbot';
import Dashboard from './pages/dashboard/Dashboard';
import { AuthProvider } from './lib/auth-context';
import { LanguageProvider, useLanguage } from './lib/language-context';
import ProtectedRoute from './components/protected-route';
import Layout from './components/layout';
    
// HomePage component (formerly the App content)
const HomePage: React.FC = () => {
  const textRevealRef = React.useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = React.useState(false);
  const { t } = useLanguage();
  
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
    <div className="min-h-screen w-full">
      {/* Main Content */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center pt-10 w-full overflow-x-hidden">
        {/* Floating Badge with Shiny Effect */}
        <CoolMode>
          <ShinyButton className="mb-6 bg-gray-950 border border-gray-800/50 rounded-full px-4 py-1.5 text-gray-400 text-sm">
            <span className="mr-2 text-amber-500">✨</span>
            <span className="font-medium">{t('introducing')} Clara</span>
            <ArrowRight className="ml-2 h-3 w-3 inline" />
          </ShinyButton>
        </CoolMode>
        
        <div className="text-center w-full max-w-4xl mx-auto px-4">
          <h1 className="tracking-tighter leading-tight mb-8">
            <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold block mb-2 text-white">Clara</span>
            <span className="text-4xl sm:text-5xl md:text-6xl font-medium block bg-gradient-to-r from-white via-blue-300 to-blue-500 text-transparent bg-clip-text animate-gradient-x bg-300%">{t('healthBuddy')}</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('homeDescription')}
            <br className="hidden md:block" />
            {t('homeDescriptionCont')}
          </p>
          <div className="flex justify-center items-center">
            <Link to="/auth?mode=signup">
              <PulsatingButton className="inline-flex items-center whitespace-nowrap">
                <span>{t('getStarted')}</span>
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
              {t('meetClara')}
            </span>
          </TextReveal>
          
          <TextReveal className="h-[30vh]">
            <span className="text-xl md:text-2xl lg:text-3xl text-blue-300">
              {t('healthTagline')}
            </span>
          </TextReveal>
          
          <div className="h-[30vh]"></div> {/* Spacer after animation ends */}
      </div>

        {/* Features Section */}
        <FeaturesSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
      </div>
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
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/medical-history" element={<ProtectedRoute><Layout><MedicalHistory /></Layout></ProtectedRoute>} />
            <Route path="/lab-report-analysis" element={<ProtectedRoute><Layout><LabReportAnalysis /></Layout></ProtectedRoute>} />
            <Route path="/ai-diagnosis" element={<ProtectedRoute><Layout><AiDiagnosis /></Layout></ProtectedRoute>} />
            <Route path="/mental-health-chatbot" element={<ProtectedRoute><Layout><MentalHealthChatbot /></Layout></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;