import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { User, Settings, LogOut } from 'lucide-react';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // Handler for logout
  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Profile Popup */}
      <div className="fixed right-4 top-16 z-50 w-72 rounded-xl bg-gray-900 border border-gray-800/50 shadow-lg overflow-hidden">
        {/* Header with user info */}
        <div className="bg-gray-800/50 p-4">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mr-3">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-medium text-white">{user?.name}</h3>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="p-2">
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-800 text-gray-300 transition-colors">
            <User className="h-5 w-5 mr-3" />
            <span>{t('viewProfile') || 'View Profile'}</span>
          </button>
          
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-800 text-gray-300 transition-colors">
            <Settings className="h-5 w-5 mr-3" />
            <span>{t('settings') || 'Settings'}</span>
          </button>
          
          <div className="my-1 border-t border-gray-800"></div>
          
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center p-3 rounded-lg hover:bg-gray-800 text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>{t('logout') || 'Logout'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePopup;