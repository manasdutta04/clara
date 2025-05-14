import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Language = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations for demonstration
const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome: 'Welcome back',
    logout: 'Logout',
    dashboard: 'Dashboard',
    healthSummary: 'Your Health Summary',
    recentActivity: 'Recent Activity',
    medicalHistory: 'Medical History',
    labReportAnalysis: 'Lab Report Analysis',
    aiDiagnosis: 'AI Diagnosis',
    mentalHealthChatbot: 'Mental Health Chatbot',
    languageSelector: 'Language',
  },
  hi: {
    welcome: 'वापस स्वागत है',
    logout: 'लॉग आउट',
    dashboard: 'डैशबोर्ड',
    healthSummary: 'आपका स्वास्थ्य सारांश',
    recentActivity: 'हाल की गतिविधि',
    medicalHistory: 'चिकित्सा इतिहास',
    labReportAnalysis: 'लैब रिपोर्ट विश्लेषण',
    aiDiagnosis: 'एआई निदान',
    mentalHealthChatbot: 'मानसिक स्वास्थ्य चैटबॉट',
    languageSelector: 'भाषा',
  },
  bn: {
    welcome: 'ফিরে স্বাগতম',
    logout: 'লগ আউট',
    dashboard: 'ড্যাশবোর্ড',
    healthSummary: 'আপনার স্বাস্থ্য সারাংশ',
    recentActivity: 'সাম্প্রতিক কার্যকলাপ',
    medicalHistory: 'চিকিৎসা ইতিহাস',
    labReportAnalysis: 'ল্যাব রিপোর্ট বিশ্লেষণ',
    aiDiagnosis: 'এআই রোগ নির্ণয়',
    mentalHealthChatbot: 'মানসিক স্বাস্থ্য চ্যাটবট',
    languageSelector: 'ভাষা',
  },
  te: {
    welcome: 'తిరిగి స్వాగతం',
    logout: 'లాగ్ అవుట్',
    dashboard: 'డాష్‌బోర్డ్',
    healthSummary: 'మీ ఆరోగ్య సారాంశం',
    recentActivity: 'ఇటీవలి కార్యాచరణ',
    medicalHistory: 'వైద్య చరిత్ర',
    labReportAnalysis: 'ల్యాబ్ నివేదిక విశ్లేషణ',
    aiDiagnosis: 'AI నిర్ధారణ',
    mentalHealthChatbot: 'మానసిక ఆరోగ్య చాట్‌బాట్',
    languageSelector: 'భాష',
  },
  ta: {
    welcome: 'மீண்டும் வரவேற்கிறோம்',
    logout: 'வெளியேறு',
    dashboard: 'டாஷ்போர்டு',
    healthSummary: 'உங்கள் ஆரோக்கிய சுருக்கம்',
    recentActivity: 'சமீபத்திய செயல்பாடு',
    medicalHistory: 'மருத்துவ வரலாறு',
    labReportAnalysis: 'ஆய்வக அறிக்கை பகுப்பாய்வு',
    aiDiagnosis: 'AI நோயறிதல்',
    mentalHealthChatbot: 'மன ஆரோக்கிய சேட்போட்',
    languageSelector: 'மொழி',
  },
  mr: {
    welcome: 'पुन्हा स्वागत आहे',
    logout: 'लॉग आउट',
    dashboard: 'डॅशबोर्ड',
    healthSummary: 'तुमचा आरोग्य सारांश',
    recentActivity: 'अलीकडील क्रियाकलाप',
    medicalHistory: 'वैद्यकीय इतिहास',
    labReportAnalysis: 'लॅब अहवाल विश्लेषण',
    aiDiagnosis: 'AI निदान',
    mentalHealthChatbot: 'मानसिक आरोग्य चॅटबॉट',
    languageSelector: 'भाषा',
  },
  gu: {
    welcome: 'પાછા આવ્યા સ્વાગત છે',
    logout: 'લૉગ આઉટ',
    dashboard: 'ડેશબોર્ડ',
    healthSummary: 'તમારો આરોગ્ય સારાંશ',
    recentActivity: 'તાજેતરની પ્રવૃત્તિ',
    medicalHistory: 'તબીબી ઇતિહાસ',
    labReportAnalysis: 'લેબ રિપોર્ટ વિશ્લેષણ',
    aiDiagnosis: 'AI નિદાન',
    mentalHealthChatbot: 'માનસિક આરોગ્ય ચેટબોટ',
    languageSelector: 'ભાષા',
  },
  kn: {
    welcome: 'ಮತ್ತೆ ಸ್ವಾಗತ',
    logout: 'ಲಾಗ್ ಔಟ್',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    healthSummary: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಾರಾಂಶ',
    recentActivity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
    medicalHistory: 'ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ',
    labReportAnalysis: 'ಲ್ಯಾಬ್ ವರದಿ ವಿಶ್ಲೇಷಣೆ',
    aiDiagnosis: 'AI ರೋಗನಿರ್ಣಯ',
    mentalHealthChatbot: 'ಮಾನಸಿಕ ಆರೋಗ್ಯ ಚಾಟ್‌ಬಾಟ್',
    languageSelector: 'ಭಾಷೆ',
  },
  ml: {
    welcome: 'തിരികെ സ്വാഗതം',
    logout: 'ലോഗൗട്ട്',
    dashboard: 'ഡാഷ്ബോർഡ്',
    healthSummary: 'നിങ്ങളുടെ ആരോഗ്യ സംഗ്രഹം',
    recentActivity: 'സമീപകാല പ്രവർത്തനം',
    medicalHistory: 'മെഡിക്കൽ ചരിത്രം',
    labReportAnalysis: 'ലാബ് റിപ്പോർട്ട് വിശകലനം',
    aiDiagnosis: 'AI രോഗനിർണ്ണയം',
    mentalHealthChatbot: 'മാനസിക ആരോഗ്യ ചാറ്റ്ബോട്ട്',
    languageSelector: 'ഭാഷ',
  },
  pa: {
    welcome: 'ਵਾਪਸ ਆਉਣ \'ਤੇ ਸਵਾਗਤ ਹੈ',
    logout: 'ਲੌਗ ਆਊਟ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    healthSummary: 'ਤੁਹਾਡਾ ਸਿਹਤ ਸਾਰ',
    recentActivity: 'ਹਾਲੀਆ ਗਤੀਵਿਧੀ',
    medicalHistory: 'ਮੈਡੀਕਲ ਇਤਿਹਾਸ',
    labReportAnalysis: 'ਲੈਬ ਰਿਪੋਰਟ ਵਿਸ਼ਲੇਸ਼ਣ',
    aiDiagnosis: 'AI ਨਿਦਾਨ',
    mentalHealthChatbot: 'ਮਾਨਸਿਕ ਸਿਹਤ ਚੈਟਬੋਟ',
    languageSelector: 'ਭਾਸ਼ਾ',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  // Update localStorage when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Apply HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 