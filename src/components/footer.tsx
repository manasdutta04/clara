import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/language-context';
import { Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      // Here you would typically make an API call to your backend
      console.log('Subscribing email:', email);
      setSubscribed(true);
      setEmail('');
      // Reset subscription status after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="w-full bg-gradient-to-b from-gray-900 to-black border-t border-gray-800/50 py-12 text-gray-400 relative z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 gap-10">
          {/* Clara Info */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-gray-200">Clara</span>
            </div>
            <p className="text-sm mb-4">
              {t( 'An intelligent AI medical companion built with modern technology to provide personalized health insights.')}
            </p>
            <div className="mt-6">
              <h4 className="text-gray-300 font-medium mb-2">{t('Contact Us')}</h4>
              <a href="mailto:info@clara.com" className="text-sm hover:text-blue-400 transition-colors flex items-center pointer-events-auto">
                <span className="mr-2">✉</span> info@clara.com
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-gray-200 font-semibold text-lg mb-4 border-b border-blue-900/30 pb-2">
              {t('Features')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/medical-history" className="text-sm flex items-center hover:text-blue-400 transition-colors pointer-events-auto">
                  <span className="mr-2">➤</span>
                  {t('medicalHistory')}
                </Link>
              </li>
              <li>
                <Link to="/lab-report-analysis" className="text-sm flex items-center hover:text-blue-400 transition-colors pointer-events-auto">
                  <span className="mr-2">➤</span>
                  {t('labReportAnalysis')}
                </Link>
              </li>
              <li>
                <Link to="/ai-diagnosis" className="text-sm flex items-center hover:text-blue-400 transition-colors pointer-events-auto">
                  <span className="mr-2">➤</span>
                  {t('aiDiagnosis')}
                </Link>
              </li>
              <li>
                <Link to="/nearby-health-services" className="text-sm flex items-center hover:text-blue-400 transition-colors pointer-events-auto">
                  <span className="mr-2">➤</span>
                  {t('Near by Health Services')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-gray-200 font-semibold text-lg mb-4 border-b border-blue-900/30 pb-2">
              {t('Resources')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="https://github.com/manasdutta04/clara/blob/main/README.md" className="text-sm hover:text-blue-400 transition-colors flex items-center pointer-events-auto">
                  <span className="mr-2">➤</span>
                  {t('Documentation')}
                </Link>
              </li>
              <li>
                <Link to="https://github.com/manasdutta04/clara/blob/main/README.md" className="text-sm hover:text-blue-400 transition-colors flex items-center pointer-events-auto">
                  <span className="mr-2">➤</span>
                  {t('Api')}
                </Link>
              </li>
              <li>
                <Link to="https://github.com/manasdutta04/clara/blob/main/README.md" className="text-sm hover:text-blue-400 transition-colors flex items-center pointer-events-auto">
                  <span className="mr-2">➤</span>
                  {t('Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link to="https://github.com/manasdutta04/clara/blob/main/README.md" className="text-sm hover:text-blue-400 transition-colors flex items-center pointer-events-auto">
                  <span className="mr-2">➤</span>
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
              <a href="https://github.com/manasdutta04/clara" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors mr-4 cursor-pointer pointer-events-auto">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/manasdutta04/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors mr-4 cursor-pointer pointer-events-auto">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-gray-300 font-medium mb-2">{t('Subscribe To Our Newsletter')}</h4>
              <form onSubmit={handleSubscribe} className="mt-2">
                <input
                  type="email"
                  placeholder={t('Enter Your Email')}
                  className="w-full bg-gray-900/60 border border-gray-800/50 rounded-md py-2 px-3 text-sm text-gray-300 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-medium rounded-md transition-colors duration-300 cursor-pointer"
                >
                  {subscribed ? t('subscribed') + '!' : t('subscribe')}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Clara. {t('All Rights Reserved')} | {t('A Craft Of')} <a href="https://github.com/manasdutta04/clara?tab=readme-ov-file#-developers" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline pointer-events-auto cursor-pointer">Clara Team</a>
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