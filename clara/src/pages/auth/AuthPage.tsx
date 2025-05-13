import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { RippleButton } from '@/components/magicui/ripple-button';
import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { ShineBorder } from '@/components/magicui/shine-border';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });

  // Check if URL includes mode=signup to set initial mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [location]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log('Form submitted:', formData);
    // After successful authentication, redirect to home or dashboard
    // navigate('/');
  };

  const goBack = () => {
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
        count={50}
        pointColor="rgba(66, 153, 225, 0.6)" // blue-400 with opacity
        lineColor="rgba(66, 153, 225, 0.3)" // blue-400 with less opacity
        pointSize={2}
        pointDuration={3000}
        cursorEffect={200}
      />

      {/* Navbar with blurred background */}
      <nav className="relative z-10 w-full py-2 px-4 border-b border-gray-800/50 bg-gradient-to-r from-black/80 via-black/85 to-black/80 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* App Name */}
          <div className="text-xl font-bold text-gray-200">Clara</div>
          
          {/* Back Button */}
          <button 
            onClick={goBack}
            className="flex items-center text-gray-400 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Back to home</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center py-10 w-full overflow-hidden">
        <div className="w-full max-w-md px-8 py-6 mx-auto bg-gray-950/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl relative overflow-hidden">
          <ShineBorder 
            shineColor={["#3B82F6", "#60A5FA", "#93C5FD"]} 
            borderWidth={1.5}
            size={600}
            interval={3000}
            duration={1500}
            borderRadius={12}
          />
          {/* Auth Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Login' : 'Create account'}</h2>
            <p className="text-sm text-gray-400">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Join Clara and start your health journey'}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (only for register) */}
            {!isLogin && (
              <div className="grid gap-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="grid gap-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-500"
                placeholder="name@example.com"
              />
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-500"
                placeholder={isLogin ? "Enter your password" : "Create a password"}
              />
            </div>

            {/* Forgot Password Link (only for login) */}
            {isLogin && (
              <div className="text-right">
                <button 
                  type="button" 
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <RippleButton 
              rippleColor="#ADD8E6"
              className="w-full py-2.5 mt-2 bg-white hover:bg-gray-100 text-black font-medium rounded-md"
              type="submit"
            >
              {isLogin ? 'Sign In' : 'Create account'}
            </RippleButton>

            {/* Toggle Auth Mode */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                {isLogin 
                  ? "Don't have an account? " 
                  : "Already have an account? "}
                <span className="text-blue-400 hover:text-blue-300 font-medium">
                  {isLogin ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>

            {/* Social Login Divider */}
            <div className="relative mt-6 mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800/70"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-950/60 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center py-2 bg-gray-900/80 border border-gray-800/80 hover:bg-gray-900 text-gray-200 font-medium rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="mr-2" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Google
            </button>
          </form>
        </div>
      </main>

      {/* Footer with blurred background */}
      <footer className="relative z-10 py-4 px-6 text-center border-t border-gray-800/50 bg-gradient-to-r from-black/80 via-black/85 to-black/80 backdrop-blur-xl">
        <p className="text-gray-500">
          © 2025 Clara. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AuthPage; 