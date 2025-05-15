import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatbotPopup from './ChatbotPopup';

const ChatbotButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  // Show tooltip after a delay when the component mounts
  useEffect(() => {
    // Only show the tooltip if it hasn't been seen yet
    if (!hasBeenSeen) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        
        // Auto-hide tooltip after 10 seconds
        const hideTimer = setTimeout(() => {
          setShowTooltip(false);
        }, 10000);
        
        return () => clearTimeout(hideTimer);
      }, 3000); // Show tooltip after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [hasBeenSeen]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    
    // When user clicks, they've seen the tooltip
    if (!hasBeenSeen) {
      setHasBeenSeen(true);
      setShowTooltip(false);
    }
  };

  // Show tooltip again after 5 minutes of inactivity
  useEffect(() => {
    if (hasBeenSeen && !isChatOpen) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        
        // Auto-hide after 10 seconds
        const hideTimer = setTimeout(() => {
          setShowTooltip(false);
        }, 10000);
        
        return () => clearTimeout(hideTimer);
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearTimeout(timer);
    }
  }, [hasBeenSeen, isChatOpen]);

  return (
    <>
      {/* Tooltip message */}
      <div 
        className={`fixed bottom-20 right-4 z-[998] bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 max-w-[200px] text-sm font-medium ${
          showTooltip && !isChatOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'
        }`}
      >
        Need help with your mental wellness?
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-blue-600 transform rotate-45"></div>
      </div>

      {/* Floating button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-[999] p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        style={{
          transform: isChatOpen ? 'scale(0)' : 'scale(1)',
          opacity: isChatOpen ? 0 : 1,
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => !hasBeenSeen || setShowTooltip(false)}
      >
        <MessageSquare className="h-6 w-6" />
        
        {/* Pulsating ring effect */}
        <span className={`absolute w-full h-full rounded-full bg-blue-400/30 animate-ping`} style={{ animationDuration: '3s' }}></span>
      </button>

      {/* Chatbot popup */}
      <ChatbotPopup 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default ChatbotButton; 