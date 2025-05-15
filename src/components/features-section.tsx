import React, { useState } from "react";
import { FeatureCard } from "./magicui/feature-card";
import { MapPin, FileText, Stethoscope, Video, ClipboardList, Bell } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Nearby Health Services',
      description: 'Find healthcare providers nearby, from hospitals to specialists, with ratings and details to help you make informed decisions.',
      path: '/nearby-health-services',
      isLink: true
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
      icon: <ClipboardList className="h-6 w-6" />,
      title: t('medicalHistory'),
      description: t('medicalHistoryLong'),
      path: '/medical-history',
      isLink: true
    },
    
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

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <Link key={index} to={user ? feature.path : '/auth'} className="block h-full cursor-pointer">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className="h-full"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}; 