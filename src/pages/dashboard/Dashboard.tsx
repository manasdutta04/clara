import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Link } from 'react-router-dom';
import { Activity, FileText, Brain, MessageSquare } from 'lucide-react';
import { MagicCard } from '@/components/magicui/magic-card';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const dashboardFeatures = [
    {
      title: t('medicalHistory'),
      description: t('medicalHistoryDesc'),
      icon: <FileText className="h-8 w-8 text-blue-400" />,
      link: '/medical-history',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      title: t('labReportAnalysis'),
      description: t('labReportAnalysisDesc'),
      icon: <Activity className="h-8 w-8 text-green-400" />,
      link: '/lab-report-analysis',
      color: 'from-green-500/20 to-green-600/20'
    },
    {
      title: t('aiDiagnosis'),
      description: t('aiDiagnosisDesc'),
      icon: <Brain className="h-8 w-8 text-purple-400" />,
      link: '/ai-diagnosis',
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      title: t('mentalHealthChatbot'),
      description: t('mentalHealthChatbotDesc'),
      icon: <MessageSquare className="h-8 w-8 text-pink-400" />,
      link: '/mental-health-chatbot',
      color: 'from-pink-500/20 to-pink-600/20'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('welcome')}, {user?.name}</h1>
        <p className="text-gray-400">{t('dashboardReady')}</p>
      </div>

      {/* Dashboard Features */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-10 mb-12">
        {dashboardFeatures.map((feature, index) => (
          <Link 
            to={feature.link} 
            key={index}
            className="block group"
          >
            <MagicCard
              gradientColor={
                feature.title === t('medicalHistory') ? "#083260" :
                feature.title === t('labReportAnalysis') ? "#0A3A22" :
                feature.title === t('aiDiagnosis') ? "#2A0A3A" :
                "#3A0A1E"
              }
              borderRadius="1.5rem"
              className="h-full"
            >
              <div className="flex items-start p-16">
                <div className="p-3 rounded-lg bg-gray-900/70 mr-4">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium text-xl text-white mb-2">{feature.title}</h3>
                  <p className="text-base text-gray-400">{feature.description}</p>
                </div>
              </div>
            </MagicCard>
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
  );
};

export default Dashboard; 