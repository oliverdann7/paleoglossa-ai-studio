import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MessageCircle, Send, Loader2, ChevronLeft, BookOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../lib/hooks/useAuth";
import { useActiveLanguage } from "../lib/hooks/useActiveLanguage";
import { apiFetch } from "../lib/services/apiFetch";

interface Message {
  id?: string;
  role: string;
  content: string;
  context?: any;
  warnings?: string[];
  createdAt?: string;
}

export const Tutor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeLanguageId } = useActiveLanguage();
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('session');
  const textIdParam = searchParams.get('textId');

  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionIdParam);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [showSessionsList, setShowSessionsList] = useState(!sessionIdParam);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Load messages when session changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSessionId) return;
    };
    if (!activeSessionId || !user) return;
    fetchMessages();
  }, [activeSessionId, user]);

  const handleStartSession = async () => {
    setIsStarting(true);
    setStartError(null);
    try {
      const data = await apiFetch<{ sessionId: string; greeting: string; suggestedQuestions: string[] }>('/api/ai/tutor/start', {
        method: 'POST',
        body: { languageId: activeLanguageId, textId: textIdParam || undefined },
      });
      setActiveSessionId(data.sessionId);
      setShowSessionsList(false);
      setMessages([{ role: 'assistant', content: data.greeting, warnings: undefined }]);
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStartError(err.message || 'Could not start a tutor session. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsSending(true);
    try {
      const context = textIdParam ? { textId: textIdParam } : undefined;
      const data = await apiFetch<{ text: string; warnings?: string[] }>('/api/ai/tutor/message', {
        method: 'POST',
        body: { sessionId: activeSessionId, message: userMsg, context },
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.text, warnings: data.warnings }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response.', warnings: ['Error'] }]);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return <div className="p-12 text-center text-ink2">Sign in to use the tutor.</div>;

  if (showSessionsList) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto font-sans min-h-screen">
        <h2 className="text-[28px] font-serif font-bold text-ink mb-2">Tutor</h2>
        <p className="text-ink2 text-[15px] mb-6">Get guided help reading ancient texts.</p>
        <button onClick={handleStartSession} disabled={isStarting}
          className="w-full py-4 bg-blue text-white font-bold rounded-2xl text-[16px] hover:bg-blue/90 active:scale-[0.98] transition-all shadow-lg mb-4 disabled:opacity-60 flex items-center justify-center gap-2">
          {isStarting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isStarting ? 'Starting…' : 'Start New Session'}
        </button>
        {startError && (
          <div className="mb-6 p-3 rounded-xl bg-ruby/10 border border-ruby/20 flex items-center gap-2 text-[13px] text-ruby">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {startError}
          </div>
        )}
        {textIdParam && (
          <div className="card p-4 mb-6 bg-blue/5 border-blue/20">
            <p className="text-[13px] text-ink2">Session will be linked to the current reader text.</p>
          </div>
        )}
        <div className="text-center py-12 text-muted text-[14px]">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>Your tutor sessions will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-parch font-sans max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-bdr bg-white">
        <button onClick={() => setShowSessionsList(true)} className="text-muted hover:text-ink"><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-bold text-ink text-[15px]">Tutor</span>
        <button onClick={() => navigate('/app/library')} className="ml-auto text-muted hover:text-ink"><BookOpen className="w-4 h-4" /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-[14px]">Ask a question about the text you're reading.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn("max-w-[80%] p-4 rounded-2xl", msg.role === 'user'
              ? 'bg-blue text-white'
              : 'bg-white border border-bdr')}>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber">
                  <AlertTriangle className="w-3 h-3" />
                  {msg.warnings.map((w, j) => <span key={j}>{w}</span>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white border border-bdr p-4 rounded-2xl">
              <Loader2 className="w-5 h-5 animate-spin text-blue" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-bdr bg-white">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask about this text…"
            className="flex-1 px-4 py-3 bg-parch border border-bdr rounded-xl text-[14px] focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
          />
          <button type="submit" disabled={!input.trim() || isSending}
            className="px-4 py-3 bg-blue text-white rounded-xl hover:bg-blue/90 disabled:opacity-50 transition-all">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
