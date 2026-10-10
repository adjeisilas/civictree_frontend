import { useState, useEffect, useRef, useCallback } from 'react';
import { playPop } from './playPop';

import { Link } from 'react-router-dom';
import { Send, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { sendMessage, fetchFaqs, type FaqEntry } from '../../../services/chatbot';

interface Message {
  role: 'user' | 'bot';
  text: string;
  source?: 'faq' | 'ai';
}

interface ChatbotWindowProps {
  onClose: () => void;
}

export const ChatbotWindow = ({ onClose }: ChatbotWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! Ask me anything about our vouchers or pick a question below.' },
  ]);
  const [input, setInput] = useState('');
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [faqsLoaded, setFaqsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFaqs()
      .then((data) => {
        setFaqs(data);
        setFaqsLoaded(true);
      })
      .catch(() => setFaqsLoaded(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setShowSuggestions(false);
    setInput('');
    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendMessage(text, sessionId);
      const botMsg: Message = { role: 'bot', text: res.answer, source: res.source };
      setMessages((prev) => [...prev, botMsg]);
      playPop();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sorry, something went wrong. Please try again.', source: 'ai' },
      ]);
      playPop();
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId]);

  const filteredSuggestions = input.trim()
    ? faqs.filter((f) =>
        f.question.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5)
    : [];

  const top3 = faqs.slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageSquare size={18} />
            <Sparkles size={9} className="absolute -top-1 -right-1 text-cta fill-cta" />
          </div>
          <span className="font-sans font-semibold text-sm">CivicTree Help</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 font-sans text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-white text-text-primary shadow-sm border border-border rounded-bl-md'
              }`}
            >
              {msg.text}
              {msg.source && (
                <span
                  className={`inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase leading-none align-middle ${
                    msg.source === 'faq'
                      ? 'bg-cta/20 text-cta-800'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {msg.source === 'faq' ? 'FAQ' : 'AI'}
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-border">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {showSuggestions && faqsLoaded && top3.length > 0 && messages.length === 1 && (
        <div className="px-4 pb-2 pt-1 bg-gray-50">
          <p className="text-[11px] font-sans text-text-secondary mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {top3.map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleSend(faq.question)}
                className="text-xs font-sans px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-white hover:bg-primary/5 transition-colors"
              >
                {faq.question.length > 40 ? faq.question.slice(0, 40) + '…' : faq.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View all FAQs link */}
      {showSuggestions && faqsLoaded && faqs.length > 0 && messages.length === 1 && (
        <div className="px-4 pb-2 bg-gray-50">
          <Link
            to="/help"
            onClick={onClose}
            className="text-xs font-sans text-primary hover:underline"
          >
            View all FAQs →
          </Link>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border px-4 py-3 bg-white">
        <div className="relative">
          {input.trim() && filteredSuggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl border border-border shadow-lg overflow-hidden z-10">
              {filteredSuggestions.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => {
                    setInput(faq.question);
                    handleSend(faq.question);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-sans text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 transition-colors hover:bg-primary-hover flex-shrink-0"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
