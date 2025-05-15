import React, { useState } from "react";
import { FeatureCard } from "./magicui/feature-card";
import { MessageCircle, FileText, Stethoscope, Video, ClipboardList, Bell } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Link } from "react-router-dom";
import ChatbotPopup from "./ChatbotPopup";
import { useAuth } from "@/lib/auth-context";

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: t('mentalHealthChatbot'),
      description: t('mentalHealthChatbotLong'),
      onClick: () => {
        if (user) {
          toggleChat();
        } else {
          // If not logged in, redirect to auth page
          window.location.href = '/auth';
        }
      },
      isLink: false
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: t('labReportAnalysis'),
      description: t('labReportAnalysisLong'),
      path: '/lab-report-analysis',
      isLink: true
    },
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: t('aiDiagnosis'),
      description: t('aiDiagnosisLong'),
      path: '/ai-diagnosis',
      isLink: true
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: t('telemedicine'),
      description: t('telemedicineLong'),
      path: '#',
      isLink: true
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: t('medicalHistory'),
      description: t('medicalHistoryLong'),
      path: '/medical-history',
      isLink: true
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: t('healthReminders'),
      description: t('healthRemindersLong'),
      path: '#',
      isLink: true
    }
  ];

  return (
    <section className="w-full py-16 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
            {t('featuresHeading')} <span className="text-blue-300">{t('empower')}</span> {t('yourHealthJourney')}
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('featuresSubheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            feature.isLink ? (
              <Link key={index} to={feature.path} className="block h-full cursor-pointer">
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  className="h-full"
                />
              </Link>
            ) : (
              <div key={index} onClick={feature.onClick} className="cursor-pointer">
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  className="h-full"
                />
              </div>
            )
          ))}
        </div>
      </div>

      {/* Chatbot Popup */}
      <ChatbotPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </section>
  );
}; 