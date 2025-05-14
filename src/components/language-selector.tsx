import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

interface Language {
  code: 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa';
  name: string;
  shortName: string;
  region: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', shortName: 'EN', region: 'India' },
  { code: 'hi', name: 'हिन्दी', shortName: 'HI', region: 'India' },
  { code: 'bn', name: 'বাংলা', shortName: 'BN', region: 'India' },
  { code: 'te', name: 'తెలుగు', shortName: 'TE', region: 'India' },
  { code: 'ta', name: 'தமிழ்', shortName: 'TA', region: 'India' },
  { code: 'mr', name: 'मराठी', shortName: 'MR', region: 'India' },
  { code: 'gu', name: 'ગુજરાતી', shortName: 'GU', region: 'India' },
  { code: 'kn', name: 'ಕನ್ನಡ', shortName: 'KN', region: 'India' },
  { code: 'ml', name: 'മലയാളം', shortName: 'ML', region: 'India' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', shortName: 'PA', region: 'India' },
];

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (langCode: 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        const dropdown = document.getElementById('language-dropdown');
        if (dropdown && !dropdown.contains(target)) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative z-[999]" id="language-dropdown">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-300 hover:text-white transition-colors"
      >
        <Globe className="h-4 w-4 mr-1" />
        <span className="text-sm mr-1">{currentLanguage.shortName}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="fixed right-8 top-12 w-44 bg-gray-900 border border-gray-800 rounded-md shadow-xl z-[9999] overflow-hidden">
          {/* Region Label */}
          <div className="px-3 py-2 text-xs text-blue-400 uppercase font-medium tracking-wider border-b border-gray-800">
            {t('languageSelector')}
          </div>
          
          {/* Language List Container with scroll */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {/* Language Options */}
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={cn(
                  "w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-800 transition-colors",
                  language === lang.code ? "bg-gray-800/70" : ""
                )}
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <div className="flex items-center">
                  <span className="inline-block w-8 font-semibold text-sm text-blue-400">{lang.shortName}</span>
                  <span className="text-sm text-gray-300">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 