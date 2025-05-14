import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Activity, FileText, Brain, MessageSquare } from 'lucide-react';
import Footer from '@/components/footer';
import LanguageSelector from '@/components/language-selector';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardFeatures = [
    {
      title: t('medicalHistory'),
      description: t('medicalHistoryDesc'),
      icon: <FileText className="h-6 w-6 text-blue-400" />,
      link: '/medical-history',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      title: t('labReportAnalysis'),
      description: t('labReportAnalysisDesc'),
      icon: <Activity className="h-6 w-6 text-green-400" />,
      link: '/lab-report-analysis',
      color: 'from-green-500/20 to-green-600/20'
    },
    {
      title: t('aiDiagnosis'),
      description: t('aiDiagnosisDesc'),
      icon: <Brain className="h-6 w-6 text-purple-400" />,
      link: '/ai-diagnosis',
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      title: t('mentalHealthChatbot'),
      description: t('mentalHealthChatbotDesc'),
      icon: <MessageSquare className="h-6 w-6 text-pink-400" />,
      link: '/mental-health-chatbot',
      color: 'from-pink-500/20 to-pink-600/20'
    }
  ];

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
          <Link to="/dashboard" className="text-xl font-bold text-gray-200">Clara</Link>
          
          {/* User Profile, Language Selector, and Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-gray-300" />
              </div>
              <span className="text-sm font-medium text-gray-300">{user?.name}</span>
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
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-[100] flex-grow flex flex-col items-center py-10 w-full overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('welcome')}, {user?.name}</h1>
            <p className="text-gray-400">{t('dashboardReady')}</p>
          </div>

          {/* Dashboard Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {dashboardFeatures.map((feature, index) => (
              <Link 
                to={feature.link} 
                key={index}
                className={`block p-6 rounded-xl border border-gray-800/50 bg-gradient-to-br ${feature.color} backdrop-blur-sm hover:bg-opacity-80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 hover:scale-[1.02]`}
              >
                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-gray-900/70 mr-4">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Health Summary Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">{t('healthSummary')}</h2>
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <p className="text-gray-300 mb-2">{t('healthDataWillAppear')}</p>
                <p className="text-sm text-gray-500">{t('trackHealthMetrics')}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">{t('recentActivity')}</h2>
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6">
              <div className="text-center py-8">
                <p className="text-gray-300 mb-2">{t('noRecentActivity')}</p>
                <p className="text-sm text-gray-500">{t('recentInteractions')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard; 