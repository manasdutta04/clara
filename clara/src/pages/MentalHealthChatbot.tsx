import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Info, ExternalLink, Settings, ChevronDown, ChevronUp, ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SuggestionTopic {
  name: string;
  questions: string[];
}

const MentalHealthChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

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
  ];

  // Welcome message content
  const welcomeMessage = {
    title: "Hello! I'm Clara, your mental wellness assistant.",
    description: "I'm here to support you with stress, anxiety, and depression through personalized conversation and guidance. While I'm not a replacement for professional care, I can offer a safe space to talk and share coping strategies."
  };

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat starts
  useEffect(() => {
    if (!showWelcome && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [showWelcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage: Message = {
      id: generateId(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setHasInteracted(true);
    setIsTyping(true);

    // Simulate bot thinking and then responding
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateBotResponse = (userMessage: string): Message => {
    // Simple keyword-based response system
    // In a real application, this would connect to an AI service or backend
    const lowerCaseMessage = userMessage.toLowerCase();
    let response = '';

    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hey')) {
      response = "Hi there! How are you feeling today?";
    } 
    else if (lowerCaseMessage.includes('stress') || lowerCaseMessage.includes('stressed')) {
      response = "I'm sorry to hear you're feeling stressed. Deep breathing can help in the moment - try breathing in for 4 counts, holding for 4, and exhaling for 6. Would you like to explore some more stress management techniques?";
    } 
    else if (lowerCaseMessage.includes('anxious') || lowerCaseMessage.includes('anxiety')) {
      response = "Anxiety can be really challenging. Grounding exercises might help - try naming 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. Would you like more strategies for managing anxiety?";
    } 
    else if (lowerCaseMessage.includes('depress') || lowerCaseMessage.includes('sad')) {
      response = "I'm truly sorry you're feeling this way. Depression can make everything feel more difficult. Small steps like going outside for 5 minutes or reaching out to a friend can sometimes help. Have you been able to talk to anyone about how you're feeling?";
    } 
    else if (lowerCaseMessage.includes('sleep') || lowerCaseMessage.includes('tired')) {
      response = "Sleep problems can significantly impact mental health. Creating a consistent bedtime routine and limiting screen time before bed can help. Would you like some more specific sleep improvement tips?";
    } 
    else if (lowerCaseMessage.includes('thank')) {
      response = "You're welcome! I'm here anytime you need to talk or get support.";
    } 
    else if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('support')) {
      response = "I'm here to support you. Would you like to talk about specific techniques for managing mental health challenges, or would you prefer resources for professional support?";
    } 
    else if (lowerCaseMessage.includes('professional') || lowerCaseMessage.includes('therapist') || lowerCaseMessage.includes('doctor')) {
      response = "Seeking professional help is a brave and important step. Would you like me to provide information about finding mental health professionals in your area or online therapy options?";
    } 
    else {
      // Generic responses for when no keywords match
      const genericResponses = [
        "Thank you for sharing that with me. How does that make you feel?",
        "I hear you. Would you like to explore some coping strategies together?",
        "I appreciate you opening up. What would be most helpful for you right now?",
        "That sounds challenging. Would you like to talk more about it or would some relaxation techniques help?",
        "I'm listening. Is there a specific aspect of this that's most difficult for you?"
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }

    return {
      id: generateId(),
      content: response,
      sender: 'bot',
      timestamp: new Date()
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startChat = () => {
    setShowWelcome(false);
    
    // Add initial bot message
    const initialMessage: Message = {
      id: generateId(),
      content: userName ? 
        `Hi ${userName}! How are you feeling today?` : 
        "Hi there! How are you feeling today?",
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  };

  const setMoodAndRespond = (selectedMood: string) => {
    setMood(selectedMood);
    setShowWelcome(false);
    
    let moodResponse: string;
    
    switch(selectedMood) {
      case 'good':
        moodResponse = "I'm glad to hear you're feeling good! What would you like to talk about today?";
        break;
      case 'okay':
        moodResponse = "It's okay to have average days. Is there anything specific on your mind that you'd like to discuss?";
        break;
      case 'stressed':
        moodResponse = "I'm sorry to hear you're feeling stressed. Would you like to talk about what's causing your stress or explore some stress management techniques?";
        break;
      case 'anxious':
        moodResponse = "I understand anxiety can be difficult. Would you like to talk about what's making you anxious, or would you prefer some calming techniques?";
        break;
      case 'sad':
        moodResponse = "I'm sorry you're feeling sad. Would you like to talk about what's making you feel this way? Sometimes sharing can help lighten the burden.";
        break;
      default:
        moodResponse = "Thank you for sharing how you're feeling. What would you like to talk about today?";
    }
    
    const initialMessages: Message[] = [
      {
        id: generateId(),
        content: userName ? 
          `Hi ${userName}! How are you feeling today?` : 
          "Hi there! How are you feeling today?",
        sender: 'bot',
        timestamp: new Date()
      },
      {
        id: generateId(),
        content: `I'm feeling ${selectedMood}.`,
        sender: 'user',
        timestamp: new Date()
      },
      {
        id: generateId(),
        content: moodResponse,
        sender: 'bot',
        timestamp: new Date()
      }
    ];
    
    setMessages(initialMessages);
    setHasInteracted(true);
  };

  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
    setShowSuggestions(false);
    
    // Focus on input after selecting a suggestion
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };

  // Format timestamp to readable time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRandomEmoji = () => {
    const emojis = ['😊', '💭', '🧠', '💙', '🌱', '✨', '🔆', '💫', '🌈', '🌻'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {showWelcome ? (
          <div className="flex flex-col h-screen">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Mental Health Chatbot</h1>
              <p className="text-gray-400">
                AI-powered chat interface to help with stress, anxiety, and depression with personalized advice and support.
              </p>
            </div>
            
            <div className="flex-grow flex items-center justify-center">
              <div className="bg-gray-900 rounded-xl p-8 w-full max-w-2xl shadow-lg">
                <div className="text-center mb-6">
                  <div className="bg-blue-500/20 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{welcomeMessage.title}</h2>
                  <p className="text-gray-400">{welcomeMessage.description}</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">What should I call you? (optional)</label>
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
                
                <div className="mb-8">
                  <label className="block text-gray-300 mb-4">How are you feeling today?</label>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <button 
                      onClick={() => setMoodAndRespond('good')}
                      className="bg-gray-800 hover:bg-blue-500/20 rounded-md p-3 transition-colors"
                    >
                      <span className="text-2xl">😊</span>
                      <p className="mt-1 text-sm">Good</p>
                    </button>
                    <button 
                      onClick={() => setMoodAndRespond('okay')}
                      className="bg-gray-800 hover:bg-blue-500/20 rounded-md p-3 transition-colors"
                    >
                      <span className="text-2xl">😐</span>
                      <p className="mt-1 text-sm">Okay</p>
                    </button>
                    <button 
                      onClick={() => setMoodAndRespond('stressed')}
                      className="bg-gray-800 hover:bg-blue-500/20 rounded-md p-3 transition-colors"
                    >
                      <span className="text-2xl">😓</span>
                      <p className="mt-1 text-sm">Stressed</p>
                    </button>
                    <button 
                      onClick={() => setMoodAndRespond('anxious')}
                      className="bg-gray-800 hover:bg-blue-500/20 rounded-md p-3 transition-colors"
                    >
                      <span className="text-2xl">😰</span>
                      <p className="mt-1 text-sm">Anxious</p>
                    </button>
                    <button 
                      onClick={() => setMoodAndRespond('sad')}
                      className="bg-gray-800 hover:bg-blue-500/20 rounded-md p-3 transition-colors"
                    >
                      <span className="text-2xl">😔</span>
                      <p className="mt-1 text-sm">Sad</p>
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={startChat}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Start Chatting
                </button>
                
                <p className="text-center text-gray-500 text-xs mt-6">
                  This chatbot is not a substitute for professional medical advice, diagnosis, or treatment.
                  If you're experiencing a mental health emergency, please call your local emergency number or crisis hotline.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-screen">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => setShowWelcome(true)}  
                className="text-gray-400 hover:text-white flex items-center text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              
              <h1 className="text-xl font-semibold flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                Mental Health Chatbot
              </h1>
              
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
            
            {showSettings && (
              <div className="bg-gray-900 p-4 rounded-md mb-4 border border-gray-800">
                <h3 className="font-medium mb-2">Settings</h3>
                <div className="mb-3">
                  <label className="block text-gray-400 text-sm mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 text-sm rounded-md bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 text-sm">
                  <div className="flex">
                    <Info className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-200">
                      This chatbot provides general wellness support only and is not a substitute for professional mental health care.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex-grow bg-gray-900 rounded-lg overflow-hidden flex flex-col">
              <div className="flex-grow overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md rounded-xl px-4 py-3 ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div className="flex items-center mb-1">
                            <span className="mr-1">{getRandomEmoji()}</span>
                            <span className="text-xs font-medium text-blue-300">Clara</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="text-right mt-1">
                          <span className={`text-xs ${
                            message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-xl px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!hasInteracted && (
                    <div className="text-center text-gray-500 text-sm">
                      <p>Share how you're feeling or choose a suggestion below</p>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="px-4 pb-4">
                {!showSuggestions && hasInteracted && (
                  <button
                    onClick={() => setShowSuggestions(true)}
                    className="text-sm text-gray-400 hover:text-blue-400 mb-2 flex items-center"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    <span>Show me some topic suggestions</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </button>
                )}
                
                {showSuggestions && (
                  <>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="text-sm text-gray-400 hover:text-blue-400 mb-2 flex items-center"
                    >
                      <span>Hide suggestions</span>
                      <ChevronUp className="h-3 w-3 ml-1" />
                    </button>
                    
                    <div className="mb-3 grid grid-cols-1 gap-2">
                      {suggestionTopics.map((topic) => (
                        <div key={topic.name} className="bg-gray-800 rounded-md p-3">
                          <h4 className="text-sm font-medium mb-2 text-blue-300">{topic.name}</h4>
                          <div className="space-y-2">
                            {topic.questions.map((question) => (
                              <button
                                key={question}
                                onClick={() => handleSuggestionClick(question)}
                                className="text-left w-full text-sm text-gray-300 hover:text-white py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                <div className="flex items-end space-x-2">
                  <div className="flex-grow bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <textarea
                      ref={chatInputRef} 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-transparent text-white resize-none"
                      rows={1}
                      style={{
                        minHeight: '44px',
                        maxHeight: '120px',
                        height: 'auto'
                      }}
                    ></textarea>
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={inputMessage.trim() === ''}
                    className={`p-3 rounded-lg bg-blue-600 ${
                      inputMessage.trim() === '' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    <Send className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    Need immediate support? <a href="#" className="text-blue-400 hover:underline flex items-center justify-center">Find professional help <ExternalLink className="h-3 w-3 ml-1" /></a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalHealthChatbot;