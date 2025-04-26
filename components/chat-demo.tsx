// components/chat-demo.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

interface ChatMessage {
  type: 'user' | 'assistant' | 'typing';
  content?: string;
  delay: number;
}

const AutoChatDemo: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Demo conversation script
  const demoConversation: ChatMessage[] = [
    {
      type: 'assistant',
      content: "Hi there! 👋 I'm Lolli, your AI companion. How can I help you today?",
      delay: 1000
    },
    {
      type: 'user',
      content: "I've been feeling stressed at work lately. Do you have any quick relaxation techniques I could try?",
      delay: 3000
    },
    {
      type: 'typing',
      delay: 1500
    },
    {
      type: 'assistant',
      content: "I'm sorry to hear you're feeling stressed. Here are some quick relaxation techniques you could try during your workday:",
      delay: 3500
    },
    {
      type: 'assistant',
      content: "1. **Deep breathing**: Take 5 slow, deep breaths. Inhale for 4 counts, hold for 2, exhale for 6. This activates your parasympathetic nervous system.\n\n2. **5-4-3-2-1 method**: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.\n\n3. **Quick desk stretch**: Raise your arms above your head, roll your shoulders, and gently stretch your neck.",
      delay: 5000
    },
    {
      type: 'user',
      content: "The 5-4-3-2-1 method sounds interesting. How exactly does that help with stress?",
      delay: 4000
    },
    {
      type: 'typing',
      delay: 2000
    },
    {
      type: 'assistant',
      content: "Great question! The 5-4-3-2-1 method is a grounding technique that helps with stress and anxiety by using your five senses to bring your attention to the present moment.",
      delay: 3500
    },
    {
      type: 'assistant',
      content: "When we're stressed, our thoughts are often racing about past events or future worries. This technique interrupts that cycle by forcing your brain to focus on immediate sensory information.\n\nIt's particularly effective because it:\n- Redirects your attention away from stressors\n- Engages multiple senses simultaneously\n- Requires just enough mental effort to distract from anxious thoughts\n- Can be done discreetly anywhere\n\nMany people find it helps them regain a sense of control when feeling overwhelmed.",
      delay: 6000
    },
    {
      type: 'user',
      content: "That makes a lot of sense. I'll definitely try it next time I feel overwhelmed at work. Thanks Lolli!",
      delay: 4000
    },
    {
      type: 'typing',
      delay: 1000
    },
    {
      type: 'assistant',
      content: "You're very welcome! I'm glad I could help. Remember that consistency is key with stress management techniques - they work best when practiced regularly, not just during high-stress moments.\n\nFeel free to check back in and let me know how it works for you. Is there anything else I can help with today?",
      delay: 3000
    }
  ];

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Play the demo conversation
  useEffect(() => {
    if (currentIndex < demoConversation.length) {
      const message = demoConversation[currentIndex];
      
      const timer = setTimeout(() => {
        if (message.type === 'typing') {
          setIsTyping(true);
        } else {
          setIsTyping(false);
          setMessages(prev => [...prev, message]);
        }
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, message.delay);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-100">
        {/* Chat Header */}
        <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
          </div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="p-4 h-96 overflow-y-auto space-y-4 bg-gray-50"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : ''}`}
              >
                <div 
                  className={`rounded-lg p-3 max-w-xs md:max-w-md shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-indigo-100 text-gray-800' 
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}
                >
                  {message.type === 'assistant' && (
                    <p className="text-indigo-600 font-medium mb-1">Lolli</p>
                  )}
                  <div 
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: message.content?.replace(
                        /\*\*(.*?)\*\*/g, 
                        '<strong>$1</strong>'
                      ).replace(
                        /\n\n/g, 
                        '<br><br>'
                      ) || ''
                    }}
                  />
                </div>
              </motion.div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <div className="bg-white rounded-lg p-3 shadow-sm flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="h-2.5 w-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2.5 w-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-2.5 w-2.5 bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Chat Footer - Just for visual completeness */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center">
          <div className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-gray-400">
            Watch the demo conversation...
          </div>
          <button className="ml-2 bg-gray-200 text-gray-400 rounded-full p-2 cursor-default">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoChatDemo;