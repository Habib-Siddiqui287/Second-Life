import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Package,
  RefreshCw
} from 'lucide-react';
import { chatbotService } from '../services/savedItemService';

// Built-in SecondLife domain knowledge fallback engine
const LOCAL_KNOWLEDGE = [
  {
    keywords: ['donate', 'give', 'item', 'listing', 'upload', 'offer'],
    reply: "To donate an item on **SecondLife**:\n\n1. Sign in or create a **Donor** account.\n2. Click **'Donate an Item'** in the navigation or your dashboard.\n3. Enter the item title, description, category, and condition (*New*, *Like New*, *Good*, or *Fair*).\n4. Specify pickup location or delivery preferences and upload clear item photos.\n5. Click **Publish**! When someone requests your item, you will be notified to confirm the handover.",
    suggestions: ["What items can I donate?", "How does matching work?", "Who delivers the item?"]
  },
  {
    keywords: ['request', 'receive', 'need', 'claim', 'get item', 'how to request'],
    reply: "To request an item on **SecondLife**:\n\n1. Log into your **Receiver** account.\n2. Head over to **Browse Donations** and filter by category or condition.\n3. Open any item page to check photos, dimensions, and donor location.\n4. Click **'Request This Item'** and write a brief note explaining how it will be used.\n5. Once approved by the donor, a handover is scheduled via pickup or eco-courier!",
    suggestions: ["Where can I see my requests?", "How are organizations verified?", "Is SecondLife free?"]
  },
  {
    keywords: ['match', 'algorithm', 'score', 'percentage', 'recommend', 'rule'],
    reply: "SecondLife uses a **smart rule-based matching engine**:\n\n• **Category Alignment (40%)**: Directly matches receiver needs.\n• **Geographic Proximity (30%)**: Keeps transportation emissions low.\n• **Condition Suitability (15%)**: Aligns with your quality preference.\n• **Logistics Compatibility (15%)**: Aligns pickup vs delivery choices.\n\nItems with high compatibility appear in your **'Recommended for you'** feed with a matching score!",
    suggestions: ["How do I donate an item?", "How do I update my location?", "What can I donate?"]
  },
  {
    keywords: ['verify', 'verification', 'organization', 'license', 'ngo', 'charity', 'badge'],
    reply: "Organizations (NGOs, shelters, community centers, schools) provide their official registration number during signup.\n\nOur team inspects each submission within 24-48 hours. Once verified, organizations receive the **Verified Organization** badge and priority allocation for community donations.",
    suggestions: ["How do I register as an organization?", "How does matching work?", "Contact admin"]
  },
  {
    keywords: ['categories', 'clothes', 'furniture', 'electronics', 'books', 'shoes', 'jackets', 'bags', 'chair', 'suit'],
    reply: "SecondLife accepts items across high-need circular categories:\n\n• 🪑 **Chairs & Furniture**: Sturdy tables, dining chairs, desks, storage units.\n• 🎒 **Bags & Accessories**: Backpacks, work totes, luggage.\n• 👔 **Suits & Jackets**: Professional interview wear, winter coats, shoes.\n• 🧸 **Kids & Family**: Developmental toys, books, school supplies.\n• 💻 **Electronics**: Functional laptops, monitors, lamps, appliances.",
    suggestions: ["How do I donate an item?", "How do I request an item?", "Is SecondLife free?"]
  },
  {
    keywords: ['free', 'cost', 'fee', 'charge', 'money', 'payment', 'price'],
    reply: "Yes! SecondLife is **100% free** for both donors and receivers. Our purpose is community reuse, circular economy, and zero landfill waste—never fees, commissions, or subscriptions.",
    suggestions: ["How do I donate an item?", "How do I request an item?", "Explore categories"]
  },
  {
    keywords: ['delivery', 'pickup', 'transport', 'courier', 'shipping', 'handover'],
    reply: "Handovers happen smoothly in three convenient ways:\n\n1. **Direct Public Pickup**: Meet at an agreed safe public location or designated landmark.\n2. **SecondLife Eco-Courier**: Electric courier transport for verified non-profits or bulky items.\n3. **Community Hub Drop-off**: Convenient drop-off at verified local partner centers.",
    suggestions: ["Track my delivery", "What happens after donor approves?", "Safety guidelines"]
  }
];

const getLocalFallback = (text) => {
  const lower = (text || '').toLowerCase();
  for (const entry of LOCAL_KNOWLEDGE) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return { reply: entry.reply, suggestions: entry.suggestions };
    }
  }
  return {
    reply: "I'm here to assist you with everything on **SecondLife**! 🌿\n\nYou can ask me about donating pre-loved items, browsing and requesting goods, our rule-based matching engine, non-profit organization verification, or delivery logistics.",
    suggestions: [
      "How do I donate an item?",
      "How do I request an item?",
      "How does matching work?",
      "What categories are accepted?"
    ]
  };
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: "Hello! 👋 I'm your **SecondLife Assistant**. How can I help you give items a second life today?",
    suggestions: ["What can I donate?", "How do I request an item?", "How does matching work?"]
  }
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Send message to the backend API endpoint
      const res = await chatbotService.sendMessage(textToSend);

      // Parse response safely from backend format: { reply, suggestions }
      const reply =
        res?.reply ||
        res?.data?.reply ||
        res?.message ||
        res?.data?.message ||
        (typeof res === 'string' ? res : null);

      const suggestions = res?.suggestions || res?.data?.suggestions || [];

      if (reply) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply,
          suggestions: suggestions.length > 0 ? suggestions : ["How do I donate?", "How do I request an item?"]
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Fallback to local knowledge if response format was empty
        const fallback = getLocalFallback(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: fallback.reply,
            suggestions: fallback.suggestions
          }
        ]);
      }
    } catch (err) {
      // Seamlessly answer with local domain knowledge if network is unavailable or backend is offline
      const fallback = getLocalFallback(textToSend);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallback.reply,
        suggestions: fallback.suggestions
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Circle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open SecondLife Assistant"
            className="group flex items-center gap-2.5 px-4 py-3 bg-[#0F5D28] hover:bg-[#15803D] text-white rounded-full shadow-2xl transition-all duration-200 ring-4 ring-emerald-500/20"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-extrabold tracking-wide pr-1">SecondLife AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[calc(100vw-2rem)] sm:w-96 h-[510px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0F5D28] text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center relative">
                  <Bot className="w-4 h-4 text-emerald-200" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0F5D28]"></span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                    SecondLife Assistant
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  </h3>
                  <span className="text-[10px] text-emerald-200 font-medium">Circular Community AI</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  aria-label="Close assistant"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#15803D] text-white rounded-br-none shadow-sm font-medium'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-sm whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Suggestions chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {m.suggestions.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#15803D] border border-emerald-200/70 px-2.5 py-1 rounded-full transition-colors text-left hover:scale-[1.02]"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 w-24 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[#15803D] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#15803D] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#15803D] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about donating, matching, delivery..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-[#15803D] hover:bg-[#0F5D28] disabled:opacity-40 text-white rounded-xl transition-all shadow-sm flex items-center justify-center hover:scale-105"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
