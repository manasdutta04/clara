import React from "react";
import { FeatureCard } from "./magicui/feature-card";
import { MessageCircle, FileText, Stethoscope, Video, ClipboardList, Bell } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: t('mentalHealthChatbot'),
      description: t('mentalHealthChatbotLong')
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: t('labReportAnalysis'),
      description: t('labReportAnalysisLong')
    },
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: t('aiDiagnosis'),
      description: t('aiDiagnosisLong')
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: t('telemedicine'),
      description: t('telemedicineLong')
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: t('medicalHistory'),
      description: t('medicalHistoryLong')
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: t('healthReminders'),
      description: t('healthRemindersLong')
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

        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className="h-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}; 