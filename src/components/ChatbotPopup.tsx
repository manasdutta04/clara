import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Info, ExternalLink, Settings, ChevronDown, ChevronUp, X, MessageSquare, ArrowRight } from 'lucide-react';
import { callGroqAPI, isGroqConfigured, DEFAULT_MODEL } from '../lib/groq-api';
import { useAuth } from '../lib/auth-context';
import { trackUserActivity, Feature, Action } from '../lib/user-activity-service';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SuggestionTopic {
  name: string;
  questions: string[];
}

interface ChatConfig {
  model: string;
  temperature: number;
}

interface ChatbotPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotPopup: React.FC<ChatbotPopupProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<number>(0);
  const [chatConfig, setChatConfig] = useState<ChatConfig>({
    model: DEFAULT_MODEL,
    temperature: 0.7
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const { user, isAuthenticated } = useAuth();

  // Sample suggestion topics
  const suggestionTopics: SuggestionTopic[] = [
    {
      name: 'Stress Management',
      questions: [
        'How can I manage work-related stress?',
        'What are some quick stress relief techniques?',
        'How do I know if my stress is becoming unhealthy?'
      ]
    },
    {
      name: 'Anxiety Support',
      questions: [
        'What can I do when I feel an anxiety attack coming?',
        'How can I reduce social anxiety?',
        'Are there breathing exercises for anxiety?'
      ]
    },
    {
      name: 'Depression Help',
      questions: [
        'How can I improve my motivation when feeling depressed?',
        'What small habits can help with depression symptoms?',
        'When should I consider professional help for depression?'
      ]
    },
    {
      name: 'Sleep Improvement',
      questions: [
        'How can I improve my sleep quality?',
        'What should I do when I can\'t fall asleep?',
        'How does poor sleep affect mental health?'
      ]
    },
    {
      name: 'Self-Care',
      questions: [
        'What are some self-care activities I can do in 10 minutes?',
        'How can I create a self-care routine?',
        'Why is self-care important for mental health?'
      ]
    },
  ];

  // Welcome message content
  const welcomeMessage = {
    title: "Hello! I'm Clara, your mental wellness assistant.",
    description: "I'm here to support you with stress, anxiety, and depression through personalized conversation and guidance. While I'm not a replacement for professional care, I can offer a safe space to talk and share coping strategies."
  };

  // Check if Groq API is configured
  useEffect(() => {
    if (!isGroqConfigured()) {
      setApiError("Groq API key is not configured. Please add your API key to continue.");
    }
  }, []);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat starts
  useEffect(() => {
    if (!showWelcome && chatInputRef.current && isOpen) {
      chatInputRef.current.focus();
    }
  }, [showWelcome, isOpen]);

  // Show suggestions when chat starts (after welcome screen)
  useEffect(() => {
    if (!showWelcome && messages.length === 1) {
      setShowSuggestions(true);
    }
  }, [showWelcome, messages.length]);

  // Track chatbot usage when opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      trackUserActivity(user.id, Feature.CHATBOT, Action.VIEW);
    }
  }, [isOpen, isAuthenticated, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    // Check if Groq API is configured
    if (!isGroqConfigured()) {
      setApiError("Groq API key is not configured. Please add your API key to continue.");
      return;
    }

    const newUserMessage: Message = {
      id: generateId(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    // Add user message to UI
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // Update chat history for API
    const updatedHistory: ChatHistoryMessage[] = [...chatHistory, { role: 'user', content: inputMessage }];
    setChatHistory(updatedHistory);
    
    setInputMessage('');
    setHasInteracted(true);
    setIsTyping(true);
    setApiError(null);

    try {
      // Call Groq API
      const systemPrompt = userName
        ? `You are a mental health assistant named Clara. You're talking to ${userName}. You provide supportive, compassionate responses to help with stress, anxiety, and depression. Offer practical advice and coping strategies, while being conversational and empathetic. Never claim to be a substitute for professional mental health care.`
        : `You are a mental health assistant named Clara. You provide supportive, compassionate responses to help users with stress, anxiety, and depression. Offer practical advice and coping strategies, while being conversational and empathetic. Never claim to be a substitute for professional mental health care.`;

      const response = await callGroqAPI(
        inputMessage,
        updatedHistory,
        {
          model: chatConfig.model,
          temperature: chatConfig.temperature,
          systemPrompt
        }
      );

      if (response.success && response.text) {
        // Add bot response to UI
        const botResponse: Message = {
          id: generateId(),
          content: response.text,
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, botResponse]);
        
        // Update chat history for next API call
        setChatHistory([...updatedHistory, { role: 'assistant', content: response.text }]);
      } else {
        // Handle API error
        setApiError(`Failed to get response: ${response.error || 'Unknown error'}`);
        console.error("API error:", response.error);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setApiError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartChat = () => {
    setShowWelcome(false);
    
    // Add initial bot message
    const initialMessage: Message = {
      id: generateId(),
      content: userName ? 
        `Hi ${userName}! How are you feeling today?` : 
        "Hi there! How are you feeling today?",
      role: 'assistant',
      timestamp: new Date()
    };
    
    // Set in UI
    setMessages([initialMessage]);
    
    // Set in history for API
    setChatHistory([{ role: 'assistant', content: initialMessage.content }]);
  };

  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
    setShowSuggestions(false);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChatConfig(prev => ({
      ...prev,
      model: e.target.value
    }));
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatConfig(prev => ({
      ...prev,
      temperature: parseFloat(e.target.value)
    }));
  };

  const setActiveSuggestionTopic = (index: number) => {
    setActiveTopic(index);
  };

  const showQuickReply = messages.length > 0 && messages.length < 3;

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex flex-col bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-[350px] h-[500px] max-h-[80vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="flex items-center">
          <div className="bg-blue-500/20 p-1.5 rounded-lg mr-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
          </div>
          <h3 className="font-medium text-gray-200">Mental Health Support</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Chat Content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {showWelcome ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 text-blue-400 bg-blue-500/10 p-3 rounded-full">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{welcomeMessage.title}</h3>
            <p className="text-gray-400 text-sm mb-6">{welcomeMessage.description}</p>
            
            <div className="mb-4 w-full">
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
            </div>
            
            <button
              onClick={handleStartChat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors w-full"
            >
              Start Chatting
            </button>
            
            {apiError && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-red-400 text-xs">{apiError}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages Container */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 bg-gray-950">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.role === 'user'
                      ? 'items-end'
                      : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-800 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-gray-500 text-xs mt-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-gray-800 text-white p-3 rounded-lg rounded-bl-none max-w-[85%]">
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {apiError && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg self-center my-2">
                  <p className="text-red-400 text-xs">{apiError}</p>
                </div>
              )}
              
              {/* Quick reply suggestions that appear after first message */}
              {showQuickReply && !showSuggestions && !isTyping && (
                <div className="self-center mt-2 mb-1">
                  <div className="text-center mb-1">
                    <span className="text-xs text-gray-500">Quick replies</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
                    <button 
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-1.5 px-3 rounded-full transition-colors"
                      onClick={() => handleSuggestionClick("I'm feeling stressed today")}
                    >
                      I'm feeling stressed
                    </button>
                    <button 
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-1.5 px-3 rounded-full transition-colors"
                      onClick={() => handleSuggestionClick("I'm feeling anxious")}
                    >
                      I'm feeling anxious
                    </button>
                    <button 
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-1.5 px-3 rounded-full transition-colors"
                      onClick={() => handleSuggestionClick("I need help with sleep")}
                    >
                      Help with sleep
                    </button>
                    <button 
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-1.5 px-3 rounded-full transition-colors"
                      onClick={() => setShowSuggestions(true)}
                    >
                      More topics <ChevronDown className="h-3 w-3 inline ml-1" />
                    </button>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef}></div>
            </div>
            
            {/* Suggestions */}
            {showSuggestions && (
              <div className="px-4 py-2 bg-gray-900 border-t border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-300">Choose a topic</h4>
                  <button 
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex overflow-x-auto gap-2 mb-3 pb-1 no-scrollbar">
                  {suggestionTopics.map((topic, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-full transition-colors flex-shrink-0 ${
                        activeTopic === index 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      }`}
                      onClick={() => setActiveSuggestionTopic(index)}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  {suggestionTopics[activeTopic].questions.map((question, index) => (
                    <button
                      key={index}
                      className="text-left p-2.5 hover:bg-gray-800 rounded-lg flex items-center text-gray-300 hover:text-white transition-colors text-xs"
                      onClick={() => handleSuggestionClick(question)}
                    >
                      <span className="mr-2 flex-grow">{question}</span>
                      <ArrowRight className="h-3 w-3 text-blue-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-gray-800 bg-gray-900">
              <div className="flex items-start gap-2">
                {/* Suggestions button */}
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)} 
                  className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                  {showSuggestions ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
                
                {/* Text input */}
                <div className="flex-grow relative">
                  <textarea
                    ref={chatInputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none outline-none focus:ring-1 focus:ring-blue-500"
                    rows={1}
                    style={{ 
                      minHeight: '40px', 
                      maxHeight: '120px'
                    }}
                  />
                </div>
                
                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  disabled={inputMessage.trim() === '' || isTyping}
                  className={`p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors ${
                    inputMessage.trim() === '' || isTyping ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              
              {/* Settings toggle */}
              <div className="flex justify-between items-center mt-1.5">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  <span>{showSettings ? "Hide settings" : "Settings"}</span>
                </button>
                
                {/* Info button */}
                <button
                  className="text-xs text-gray-400 hover:text-gray-300 flex items-center transition-colors"
                >
                  <Info className="h-3 w-3 mr-1" />
                  <span>AI assistant</span>
                </button>
              </div>
              
              {/* Advanced settings */}
              {showSettings && (
                <div className="mt-2 p-2 bg-gray-800 rounded-lg text-xs">
                  <div className="mb-2">
                    <label className="block text-gray-400 mb-1">AI Model</label>
                    <select
                      value={chatConfig.model}
                      onChange={handleModelChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200"
                    >
                      <option value="llama3-70b-8192">Llama 3 (70B)</option>
                      <option value="llama3-8b-8192">Llama 3 (8B)</option>
                      <option value="mixtral-8x7b-32768">Mixtral</option>
                      <option value="gemma-7b-it">Gemma</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-1">
                      Temperature: {chatConfig.temperature.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={chatConfig.temperature}
                      onChange={handleTemperatureChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-gray-500">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotPopup; 