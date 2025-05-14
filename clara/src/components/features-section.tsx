import React from "react";
import { FeatureCard } from "./magicui/feature-card";
import { MessageCircle, FileText, Stethoscope, Video, ClipboardList, Bell } from "lucide-react";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Mental Health Chatbot",
      description: "AI-powered chat interface to help with stress, anxiety, and depression with personalized advice and support."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Lab Report Analysis",
      description: "Upload medical reports and scans to get AI-powered explanations in simple language you can understand."
    },
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: "AI Diagnosis",
      description: "Receive preliminary assessments with probability indicators, suggested precautions, and recommended OTC medicines."
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Telemedicine Integration",
      description: "Connect with healthcare professionals through secure video calls and share your medical data seamlessly."
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "Medical History",
      description: "Access your complete medical timeline with saved consultations, reports, and track health progress over time."
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Health Reminders",
      description: "Get personalized reminders for medications, appointments, and health check-ups to stay on track with your care plan."
    }
  ];

  return (
    <section className="w-full py-16 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
            Features that <span className="text-blue-300">empower</span> your health journey
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Clara combines cutting-edge AI technology with user-friendly design to provide comprehensive health support.
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