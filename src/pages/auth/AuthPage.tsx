import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { RippleButton } from '@/components/magicui/ripple-button';
import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { ShineBorder } from '@/components/magicui/shine-border';
import Footer from '@/components/footer';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isAuthenticated, error: authError, loading } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Set error from auth context if present
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    
    // Reset form data
    setFormData({
      email: '',
      password: '',
      name: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isLogin) {
        // Login
        const success = await login(formData.email, formData.password);
        if (success) {
          navigate('/dashboard');
        }
      } else {
        // Sign up
        if (!formData.name) {
          setError("Name is required for registration");
          return;
        }
        const success = await signup(formData.name, formData.email, formData.password);
        if (success) {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      console.log("Starting Google sign-in...");
      const success = await loginWithGoogle();
      if (success) {
        console.log("Google sign-in successful, navigating to dashboard");
        navigate('/dashboard');
      } else {
        console.log("Google sign-in returned false");
        setError("Failed to sign in with Google. Please try again.");
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err?.message || 'Google authentication failed');
    }
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
        count={100}
        pointColor="rgb(255, 255, 255)"
        lineColor="rgba(79, 122, 158, 0.24)"
        pointSize={1.5}
        pointDuration={3000}
        cursorEffect={150}
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
            <span>{t('backToHome')}</span>
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
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? t('login') : t('createAccount')}</h2>
            <p className="text-sm text-gray-400">
              {isLogin 
                ? t('enterCredentials') 
                : t('joinClara')}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-6 py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-md flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-md text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (only for register) */}
            {!isLogin && (
              <div className="grid gap-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-500"
                  placeholder={t('enterFullName')}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="grid gap-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t('email')}
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
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800/80 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-500"
                placeholder={isLogin ? t('enterPassword') : t('createPassword')}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <RippleButton
                rippleColor="#60A5FA"
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Mail className="h-5 w-5 mr-2" />
                )}
                {isLogin ? t('signIn') : t('createAccount')}
              </RippleButton>
            </div>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {isLogin ? t('noAccount') : t('alreadyAccount')}
              <button
                type="button"
                className="ml-1 text-blue-400 hover:text-blue-300 font-medium focus:outline-none"
                onClick={toggleAuthMode}
              >
                {isLogin ? t('register') : t('login')}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AuthPage; 