import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Link } from 'react-router-dom';
import { Activity, FileText, Brain, MapPin, MessageSquare } from 'lucide-react';
import { MagicCard } from '@/components/magicui/magic-card';
import RecentActivities from '@/components/dashboard/RecentActivities';
import HealthSummary from '@/components/dashboard/HealthSummary';
import { trackUserActivity, Feature, Action } from '@/lib/user-activity-service';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  // No longer tracking dashboard visits
  
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
      title: 'Nearby Health Services',
      description: 'Find your healthcare facilities nearby',
      icon: <MapPin className="h-8 w-8 text-pink-400" />,
      link: '/nearby-health-services',
      color: 'from-pink-500/20 to-pink-600/20'
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('welcome')}, {user?.name}</h1>
        <p className="text-gray-400">{t('dashboardReady')}</p>
      </div>

      {/* Dashboard Features */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10 mb-12">
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
                feature.title === 'Nearby Health Services' ? "#3A0A1E" :
                "#3A0A2E"
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
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            </MagicCard>
          </Link>
        ))}
      </div>

      {/* Health Summary Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">{t('healthSummary')}</h2>
        <HealthSummary />
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">{t('recentActivity')}</h2>
        <RecentActivities className="bg-gray-900/60 border border-gray-800/50" />
      </div>
    </div>
  );
};

export default Dashboard; 