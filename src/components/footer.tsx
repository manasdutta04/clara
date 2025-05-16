import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/language-context';
import { Twitter, Github, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="w-full bg-gradient-to-b from-gray-900 to-black border-t border-gray-800/50 py-12 text-gray-400">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-4 md:grid-cols-3 gap-10">
          {/* Clara Info */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-gray-200">Clara</span>
            </div>
            <p className="text-sm mb-4">
              {t( 'AI-Powered Healthcare Assistant helping to improve personal health through advanced technology and personalized insights.')}
            </p>
            <div className="mt-6">
              <h4 className="text-gray-300 font-medium mb-2">{t('Contact Us')}</h4>
              <a href="mailto:info@clarahealth.org" className="text-sm hover:text-blue-400 transition-colors flex items-center">
                <span className="mr-2">✉</span> info@clarahealth.org
              </a>
            </div>
          </div>

          {/* Features */}
          <div >
            <h3 className="text-gray-200 font-semibold text-lg mb-4 border-b border-blue-900/30 pb-2">
              {t('Features')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/medical-history" className="text-sm flex items-center hover:text-blue-400 transition-colors">
                  <span className="mr-2">▶</span>
                  {t('medicalHistory')}
                </Link>
              </li>
              <li>
                <Link to="/lab-report-analysis" className="text-sm flex items-center hover:text-blue-400 transition-colors">
                  <span className="mr-2">▶</span>
                  {t('labReportAnalysis')}
                </Link>
              </li>
              <li>
                <Link to="/ai-diagnosis" className="text-sm flex items-center hover:text-blue-400 transition-colors">
                  <span className="mr-2">▶</span>
                  {t('aiDiagnosis')}
                </Link>
              </li>
              <li>
                <Link to="/mental-health-chatbot" className="text-sm flex items-center hover:text-blue-400 transition-colors">
                  <span className="mr-2">▶</span>
                  {t('mentalHealthChatbot')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div >
            <h3 className="text-gray-200 font-semibold text-lg mb-4 border-b border-blue-900/30 pb-2">
              {t('Resources')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/documentation" className="text-sm hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  {t('Documentation')}
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-sm hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  {t('Api')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  {t('Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">▶</span>
                  {t('Terms Of Service')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-gray-200 font-semibold text-lg mb-4 border-b border-blue-900/30 pb-2">
              {t('Connect')}
            </h3>
            <div className="flex mb-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors mr-4">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors mr-4">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors mr-4">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-gray-300 font-medium mb-2">{t('Subscribe To Our Newsletter')}</h4>
              <div className="mt-2">
                <input
                  type="email"
                  placeholder={t('enterYourEmail')}
                  className="w-full bg-gray-900/60 border border-gray-800/50 rounded-md py-2 px-3 text-sm text-gray-300 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-medium rounded-md transition-colors duration-300">
                  {t('subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Clara Health. {t('All Rights Reserved')} | {t('A Craft Of')} <a href="#" className="text-blue-400 hover:underline">Clara Team</a>
          </div>
          <div className="flex items-center">
            <span className="text-blue-400 mr-2">⚡</span>
            <span className="text-sm text-gray-500">{t('Powered By AI To Protect Your Health')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;