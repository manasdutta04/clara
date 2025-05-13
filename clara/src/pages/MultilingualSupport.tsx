import React, { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

// Define available languages
interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

// Mock translations for demonstration
interface Translations {
  [key: string]: {
    title: string;
    subtitle: string;
    features: {
      mentalHealth: string;
      labReports: string;
      aiDiagnosis: string;
      telemedicine: string;
      medicalHistory: string;
      languageSupport: string;
    };
    languageSelector: string;
    currentLanguage: string;
    selectLanguage: string;
    recentlyUsed: string;
    allLanguages: string;
    searchPlaceholder: string;
    supportedFeatures: string;
    helpText: string;
    saveButton: string;
  };
}

const translations: Translations = {
  en: {
    title: "Multilingual Support",
    subtitle: "Access healthcare in your preferred language",
    features: {
      mentalHealth: "Mental Health Chatbot",
      labReports: "Lab Report Analysis",
      aiDiagnosis: "AI Diagnosis",
      telemedicine: "Telemedicine Integration",
      medicalHistory: "Medical History",
      languageSupport: "Multilingual Support"
    },
    languageSelector: "Language Selector",
    currentLanguage: "Current Language",
    selectLanguage: "Select Language",
    recentlyUsed: "Recently Used",
    allLanguages: "All Languages",
    searchPlaceholder: "Search languages...",
    supportedFeatures: "All features support multilingual access",
    helpText: "Need help with language settings?",
    saveButton: "Save Preferences"
  },
  bn: {
    title: "বহুভাষিক সমর্থন",
    subtitle: "আপনার পছন্দের ভাষায় স্বাস্থ্যসেবা পান",
    features: {
      mentalHealth: "মানসিক স্বাস্থ্য চ্যাটবট",
      labReports: "ল্যাব রিপোর্ট বিশ্লেষণ",
      aiDiagnosis: "এআই রোগ নির্ণয়",
      telemedicine: "টেলিমেডিসিন ইন্টিগ্রেশন",
      medicalHistory: "চিকিৎসা ইতিহাস",
      languageSupport: "বহুভাষিক সমর্থন"
    },
    languageSelector: "ভাষা নির্বাচক",
    currentLanguage: "বর্তমান ভাষা",
    selectLanguage: "ভাষা নির্বাচন করুন",
    recentlyUsed: "সম্প্রতি ব্যবহৃত",
    allLanguages: "সমস্ত ভাষা",
    searchPlaceholder: "ভাষা অনুসন্ধান করুন...",
    supportedFeatures: "সমস্ত বৈশিষ্ট্য বহুভাষিক অ্যাক্সেস সমর্থন করে",
    helpText: "ভাষা সেটিংসের ব্যাপারে সাহায্যের প্রয়োজন?",
    saveButton: "পছন্দগুলি সংরক্ষণ করুন"
  },
  hi: {
    title: "बहुभाषी सहायता",
    subtitle: "अपनी पसंदीदा भाषा में स्वास्थ्य सेवा तक पहुँचें",
    features: {
        mentalHealth: "मानसिक स्वास्थ्य चैटबॉट",
        labReports: "लैब रिपोर्ट विश्लेषण",
        aiDiagnosis: "एआई निदान",
        telemedicine: "टेलीमेडिसिन एकीकरण",
        medicalHistory: "चिकित्सा इतिहास",
        languageSupport: "बहुभाषी सहायता"
    },
    languageSelector: "भाषा चयनकर्ता",
    currentLanguage: "वर्तमान भाषा",
    selectLanguage: "भाषा चुने",
    recentlyUsed: "हाल ही में प्रयुक्त",
    allLanguages: "सभी भाषाएँ",
    searchPlaceholder: "भाषाएँ खोजें...",
    supportedFeatures: "सभी सुविधाएँ बहुभाषी पहुँच का समर्थन करती हैं",
    helpText: "भाषा सेटिंग में सहायता चाहिए?",
    saveButton: "प्राथमिकताएँ सहेजें"
  },
  es: {
    title: "Soporte Multilingüe",
    subtitle: "Acceda a la atención médica en su idioma preferido",
    features: {
      mentalHealth: "Chatbot de Salud Mental",
      labReports: "Análisis de Informes de Laboratorio",
      aiDiagnosis: "Diagnóstico con IA",
      telemedicine: "Integración de Telemedicina",
      medicalHistory: "Historial Médico",
      languageSupport: "Soporte Multilingüe"
    },
    languageSelector: "Selector de Idioma",
    currentLanguage: "Idioma Actual",
    selectLanguage: "Seleccionar Idioma",
    recentlyUsed: "Usados Recientemente",
    allLanguages: "Todos los Idiomas",
    searchPlaceholder: "Buscar idiomas...",
    supportedFeatures: "Todas las funciones admiten acceso multilingüe",
    helpText: "¿Necesita ayuda con la configuración de idioma?",
    saveButton: "Guardar Preferencias"
  },
  fr: {
    title: "Support Multilingue",
    subtitle: "Accédez aux soins de santé dans votre langue préférée",
    features: {
      mentalHealth: "Chatbot de Santé Mentale",
      labReports: "Analyse des Rapports de Laboratoire",
      aiDiagnosis: "Diagnostic IA",
      telemedicine: "Intégration de Télémédecine",
      medicalHistory: "Historique Médical",
      languageSupport: "Support Multilingue"
    },
    languageSelector: "Sélecteur de Langue",
    currentLanguage: "Langue Actuelle",
    selectLanguage: "Sélectionner la Langue",
    recentlyUsed: "Récemment Utilisés",
    allLanguages: "Toutes les Langues",
    searchPlaceholder: "Rechercher des langues...",
    supportedFeatures: "Toutes les fonctionnalités prennent en charge l'accès multilingue",
    helpText: "Besoin d'aide avec les paramètres de langue?",
    saveButton: "Enregistrer les Préférences"
  },
  // Add additional language translations as needed
  zh: {
    title: "多语言支持",
    subtitle: "使用您首选的语言获取医疗保健",
    features: {
      mentalHealth: "心理健康聊天机器人",
      labReports: "实验室报告分析",
      aiDiagnosis: "AI诊断",
      telemedicine: "远程医疗集成",
      medicalHistory: "病历",
      languageSupport: "多语言支持"
    },
    languageSelector: "语言选择器",
    currentLanguage: "当前语言",
    selectLanguage: "选择语言",
    recentlyUsed: "最近使用",
    allLanguages: "所有语言",
    searchPlaceholder: "搜索语言...",
    supportedFeatures: "所有功能都支持多语言访问",
    helpText: "需要语言设置帮助？",
    saveButton: "保存首选项"
  }
};

// For languages without specific translations, default to English
const getTranslation = (langCode: string) => {
  return translations[langCode] || translations['en'];
};

const MultilingualSupport: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentLanguages, setRecentLanguages] = useState<string[]>(['en']);
  
  // Load saved language preference from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
    
    const savedRecentLanguages = localStorage.getItem('recentLanguages');
    if (savedRecentLanguages) {
      setRecentLanguages(JSON.parse(savedRecentLanguages));
    }
  }, []);
  
  const t = getTranslation(currentLanguage);
  
  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    
    // Update recent languages
    const newRecentLangs = [
      langCode,
      ...recentLanguages.filter(code => code !== langCode)
    ].slice(0, 3); // Keep only 3 most recent
    
    setRecentLanguages(newRecentLangs);
    localStorage.setItem('recentLanguages', JSON.stringify(newRecentLangs));
    
    setIsDropdownOpen(false);
  };
  
  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const recentLanguagesList = languages.filter(lang => 
    recentLanguages.includes(lang.code)
  );

  return (
    <div className="bg-black text-white min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-gray-400">{t.subtitle}</p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Language Selector Card */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg col-span-1">
            <div className="flex items-center mb-6">
              <Globe className="text-blue-400 mr-3" size={24} />
              <h2 className="text-xl font-semibold">{t.languageSelector}</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">{t.currentLanguage}</p>
              <div 
                className="bg-gray-800 p-3 rounded-lg flex justify-between items-center cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{languages.find(lang => lang.code === currentLanguage)?.nativeName}</span>
                <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
            
            {isDropdownOpen && (
              <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                <div className="p-3 border-b border-gray-700">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-gray-700 p-2 rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {recentLanguagesList.length > 0 && (
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">{t.recentlyUsed}</p>
                    {recentLanguagesList.map(lang => (
                      <div 
                        key={lang.code}
                        className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                        onClick={() => handleLanguageChange(lang.code)}
                      >
                        <span>{lang.nativeName} ({lang.name})</span>
                        {currentLanguage === lang.code && <Check size={16} className="text-blue-400" />}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-400 p-3 border-b border-gray-700">{t.allLanguages}</p>
                  {filteredLanguages.map(lang => (
                    <div 
                      key={lang.code}
                      className="flex items-center justify-between p-3 hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <span>{lang.nativeName} ({lang.name})</span>
                      {currentLanguage === lang.code && <Check size={16} className="text-blue-400" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              {t.saveButton}
            </button>
          </div>
          
          {/* Features Preview */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">{t.supportedFeatures}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feature Cards */}
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-medium">{t.features.mentalHealth}</h3>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-medium">{t.features.labReports}</h3>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-medium">{t.features.aiDiagnosis}</h3>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-medium">{t.features.telemedicine}</h3>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="font-medium">{t.features.medicalHistory}</h3>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-400">
                <h3 className="font-medium">{t.features.languageSupport}</h3>
              </div>
            </div>
            
            {/* Language Preview */}
            <div className="mt-8 bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{languages.find(lang => lang.code === currentLanguage)?.name} Preview</h3>
                <Globe className="text-blue-400" size={20} />
              </div>
              <p className="text-gray-400 mb-3">
                This is how the application will appear in {languages.find(lang => lang.code === currentLanguage)?.name}.
                All interface elements, notifications, and content will be displayed in your selected language.
              </p>
              <p className="text-sm text-blue-400 cursor-pointer hover:underline">
                {t.helpText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultilingualSupport;