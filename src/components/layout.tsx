import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import Footer from '@/components/footer';
import { cn } from '@/lib/utils';
import LanguageSelector from '@/components/language-selector';
import { RippleButton } from "@/components/magicui/ripple-button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

      {/* Navbar with blurred background */}
      <nav className="sticky top-0 z-[900] w-full py-3 px-4 border-b border-gray-800/50 bg-gradient-to-r from-black/95 via-black/95 to-black/95 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* App Name */}
          <Link to={user ? "/dashboard" : "/"} className="text-xl font-bold text-gray-200">Clara</Link>
          
          {/* User Profile, Language Selector, and Logout OR Login/Signup buttons */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center mr-2">
                  <User className="h-4 w-4 text-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-300">{user.name}</span>
              </div>
              
              {/* Language Selector */}
              <LanguageSelector />
              
              <button 
                onClick={handleLogout}
                className="flex items-center text-gray-400 hover:text-gray-200 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="text-sm">{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex space-x-2 items-center">
              <LanguageSelector />
              <Link to="/auth">
                <RippleButton 
                  rippleColor="#ADD8E6" 
                  className="py-1 px-3 text-sm bg-transparent hover:bg-gray-800 text-gray-200 font-medium rounded-lg"
                >
                  {t('login')}
                </RippleButton>
              </Link>
              <Link to="/auth?mode=signup">
                <RippleButton 
                  rippleColor="#ADD8E6"
                  className="py-1.5 px-4 text-sm bg-white hover:bg-gray-100 text-black font-medium rounded-full"
                >
                  {t('signup')}
                </RippleButton>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-[100] flex-grow flex flex-col items-center py-10 w-full overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout; 