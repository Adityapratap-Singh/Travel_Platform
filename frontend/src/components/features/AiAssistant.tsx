import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { chatWithAi } from '../../lib/api';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hi there! I\'m your Travel Buddy. Click me to chat or ask for advice!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Gather context
      const context = {
        path: location.pathname,
        pageTitle: document.title,
        // You could add more context here like current destination ID if parsed from URL
      };

      const response = await chatWithAi(userMessage.text, context);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.reply
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Oops! I'm having trouble connecting to my brain right now. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Preset options based on context
  const getSuggestions = () => {
    if (location.pathname.includes('destinations/')) {
      return ["Best time to visit?", "Local food recommendations", "Safety tips"];
    }
    if (location.pathname.includes('plan-trip')) {
      return ["Help me build an itinerary", "Budget planning tips", "Packing list"];
    }
    return ["Suggest a random destination", "How do I plan a trip?", "Find cheap flights"];
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 w-80 sm:w-96 mb-4 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Travel Buddy AI</h3>
                <span className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-[300px]">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestions */}
          {!isTyping && messages.length < 3 && (
             <div className="bg-gray-50 px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
               {getSuggestions().map((suggestion) => (
                 <button
                   key={suggestion}
                   onClick={() => {
                     setInputValue(suggestion);
                     // Optional: auto-send
                     // handleSendMessage(); 
                   }}
                   className="whitespace-nowrap text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                 >
                   {suggestion}
                 </button>
               ))}
             </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for travel advice..."
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-gray-200 text-gray-600 rotate-90' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
            <div className="absolute -inset-2 bg-blue-400/30 rounded-full animate-ping -z-10"></div>
          </>
        )}
        
        {/* Tooltip/Greeting Bubble */}
        {!isOpen && (
          <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl rounded-tr-none shadow-md border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-sm font-medium text-gray-800">Need help planning?</p>
          </div>
        )}
      </button>
    </div>
  );
}
