import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatbotPopup from './ChatbotPopup';

const ChatbotButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Remove showTooltip and hasBeenSeen states and just have one state for animation
  const [isAnimating, setIsAnimating] = useState(false);

  // Pulse animation effect
  useEffect(() => {
    // Set up an interval to toggle the animation state
    const animationInterval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 3000); // Toggle every 3 seconds
    
    return () => clearInterval(animationInterval);
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Tooltip message - always visible until chat is opened */}
      <div 
        className={`fixed bottom-20 right-4 z-[998] bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-500 max-w-[200px] text-sm font-medium ${
          isChatOpen ? 'opacity-0 transform translate-y-2 pointer-events-none' : 'opacity-100 transform translate-y-0'
        } ${isAnimating ? 'animate-pulse' : ''}`}
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
      >
        <MessageSquare className="h-6 w-6" />
        
        {/* Pulsating ring effect */}
        <span className="absolute w-full h-full rounded-full bg-blue-400/30 animate-ping" style={{ animationDuration: '3s' }}></span>
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