import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  Loader2,
  ChevronLeft,
  BookOpen,
  AlertTriangle,
  Plus,
  Clock,
  GraduationCap,
  BookText,
  Church,
  ScrollText,
  Heart,
  Landmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { apiFetch } from '../lib/services/apiFetch.js';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id?: string;
  role: string;
  content: string;
  context?: any;
  warnings?: string[] | null;
  createdAt?: string;
}

type TutorMode = 'beginner' | 'grammar' | 'seminary' | 'scholar' | 'devotional' | 'historical';

const TUTOR_MODE_OPTIONS: {
  id: TutorMode;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { id: 'beginner', label: 'Beginner', description: 'Simple, encouraging explanations', icon: GraduationCap },
  { id: 'grammar', label: 'Grammar', description: 'Morphology & syntax focus', icon: BookText },
  { id: 'seminary', label: 'Seminary', description: 'Exegetical & theological', icon: Church },
  { id: 'scholar', label: 'Scholar', description: 'Philological precision', icon: ScrollText },
  { id: 'devotional', label: 'Devotional', description: 'Contemplative reading', icon: Heart },
  { id: 'historical', label: 'Historical', description: 'Cultural & archaeological', icon: Landmark },
];

interface Session {
  id: string;
  languageId: string;
  title: string;
  textId: string | null;
  mode: TutorMode | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const Tutor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeLanguageId } = useActiveLanguage();
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('session');
  const textIdParam = searchParams.get('textId');
  const promptParam = searchParams.get('prompt');

  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionIdParam);
  const autoPromptSentRef = useRef(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [showSessionsList, setShowSessionsList] = useState(!sessionIdParam);
  const [selectedMode, setSelectedMode] = useState<TutorMode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load sessions list
  useEffect(() => {
    if (!user || !showSessionsList) return;
    const load = async () => {
      setIsLoadingSessions(true);
      try {
        const data = await apiFetch<{ sessions: Session[] }>('/api/ai/tutor/sessions');
        setSessions(data.sessions);
      } catch {
        setSessions([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    load();
  }, [user, showSessionsList]);

  // Load messages when a session is active
  useEffect(() => {
    if (!activeSessionId || !user) return;
    const load = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await apiFetch<{
          session: Session;
          messages: Message[];
          suggestedQuestions: string[];
        }>(`/api/ai/tutor/sessions/${activeSessionId}`);
        setMessages(data.messages);
        setSuggestedQuestions(data.suggestedQuestions || []);
      } catch {
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    load();
  }, [activeSessionId, user]);

  // Auto-start session and send prompt when navigated with ?prompt=
  useEffect(() => {
    if (!promptParam || !user || autoPromptSentRef.current || activeSessionId) return;
    autoPromptSentRef.current = true;
    const autoStart = async () => {
      setIsStarting(true);
      setShowSessionsList(false);
      try {
        const data = await apiFetch<{
          sessionId: string;
          greeting: string;
          suggestedQuestions: string[];
        }>('/api/ai/tutor/start', {
          method: 'POST',
          body: { languageId: activeLanguageId, textId: textIdParam || undefined },
        });
        setActiveSessionId(data.sessionId);
        setMessages([{ role: 'assistant', content: data.greeting }]);

        // Immediately send the prompt as the first user message
        setMessages((prev) => [...prev, { role: 'user', content: promptParam }]);
        setIsSending(true);
        const ctx = textIdParam ? { textId: textIdParam } : undefined;
        const reply = await apiFetch<{ text: string; warnings?: string[] }>(
          '/api/ai/tutor/message',
          {
            method: 'POST',
            body: { sessionId: data.sessionId, message: promptParam, context: ctx },
          }
        );
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: reply.text, warnings: reply.warnings },
        ]);
      } catch (err: any) {
        setStartError(err.message || 'Could not start a tutor session.');
      } finally {
        setIsStarting(false);
        setIsSending(false);
      }
    };
    autoStart();
  }, [promptParam, user, activeSessionId, activeLanguageId, textIdParam]);

  const handleStartSession = async () => {
    setIsStarting(true);
    setStartError(null);
    try {
      const data = await apiFetch<{
        sessionId: string;
        greeting: string;
        suggestedQuestions: string[];
      }>('/api/ai/tutor/start', {
        method: 'POST',
        body: {
          languageId: activeLanguageId,
          textId: textIdParam || undefined,
          mode: selectedMode || undefined,
        },
      });
      setActiveSessionId(data.sessionId);
      setShowSessionsList(false);
      setMessages([{ role: 'assistant', content: data.greeting }]);
      setSuggestedQuestions(data.suggestedQuestions || []);
    } catch (err: any) {
      setStartError(err.message || 'Could not start a tutor session. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleOpenSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowSessionsList(false);
    setMessages([]);
  };

  const handleSend = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || !activeSessionId) return;
    setInput('');
    setSuggestedQuestions([]);
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsSending(true);
    try {
      const context = textIdParam ? { textId: textIdParam } : undefined;
      const data = await apiFetch<{ text: string; warnings?: string[] }>('/api/ai/tutor/message', {
        method: 'POST',
        body: { sessionId: activeSessionId, message: userMsg, context },
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.text, warnings: data.warnings },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to get response. Please try again.',
          warnings: ['Error'],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return <div className="p-12 text-center text-ink2">Sign in to use the tutor.</div>;

  // ── Session list ────────────────────────────────────────────────────
  if (showSessionsList) {
    return (
      <div className="p-6 md:p-12 pt-safe-page max-w-2xl mx-auto font-sans min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[28px] font-serif font-bold text-ink">Tutor</h2>
            <p className="text-ink2 text-[14px]">Get guided help reading ancient texts.</p>
          </div>
          <button
            onClick={() => navigate('/app/library')}
            className="text-muted hover:text-ink transition-colors"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted mb-2">
            Tutor Mode
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TUTOR_MODE_OPTIONS.map((m) => {
              const Icon = m.icon;
              const active = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(active ? null : m.id)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all',
                    active
                      ? 'border-blue bg-blue/10 shadow-sm'
                      : 'border-bdr hover:border-blue/30 hover:bg-parch2'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn('w-4 h-4', active ? 'text-blue' : 'text-muted')} />
                    <span className={cn('text-[13px] font-semibold', active ? 'text-blue' : 'text-ink')}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted leading-tight">{m.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleStartSession}
          disabled={isStarting}
          className="w-full py-4 bg-blue text-white font-bold rounded-2xl text-[16px] hover:bg-blue/90 active:scale-[0.98] transition-all shadow-lg mb-6 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
          {isStarting
            ? 'Starting…'
            : selectedMode
              ? `New ${TUTOR_MODE_OPTIONS.find((m) => m.id === selectedMode)?.label} Session`
              : 'New Session'}
        </button>

        {startError && (
          <div className="mb-6 p-3 rounded-xl bg-ruby/10 border border-ruby/20 flex items-center gap-2 text-[13px] text-ruby">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {startError}
          </div>
        )}

        {textIdParam && (
          <div className="card p-4 mb-6 bg-blue/5 border-blue/20">
            <p className="text-[13px] text-ink2">
              New session will be linked to the text you are reading.
            </p>
          </div>
        )}

        {isLoadingSessions ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-muted text-[14px]">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>No sessions yet. Start one above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-widest font-bold text-muted mb-3">
              Recent Sessions
            </p>
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleOpenSession(s.id)}
                className="w-full card p-4 text-left hover:border-blue/30 hover:shadow-sm transition-all flex items-start gap-3"
              >
                <MessageCircle className="w-4 h-4 text-blue mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink truncate">{s.title}</p>
                    {s.mode && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue/10 text-blue rounded-full shrink-0">
                        {TUTOR_MODE_OPTIONS.find((m) => m.id === s.mode)?.label ?? s.mode}
                      </span>
                    )}
                  </div>
                  {s.updatedAt && (
                    <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Chat view ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-parch font-sans max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-bdr bg-parch2">
        <button
          onClick={() => {
            setShowSessionsList(true);
            setActiveSessionId(null);
            setMessages([]);
          }}
          className="text-muted hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-ink text-[15px] flex-1">Tutor</span>
        {textIdParam && (
          <button
            onClick={() => navigate(`/app/reader/${textIdParam}`)}
            className="text-muted hover:text-ink transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue" />
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-[14px]">Ask a question about the text you're reading.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] p-4 rounded-2xl',
                    msg.role === 'user'
                      ? 'bg-blue text-white'
                      : 'bg-white border border-bdr shadow-sm'
                  )}
                >
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.warnings && msg.warnings.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber">
                      <AlertTriangle className="w-3 h-3" />
                      {msg.warnings.map((w, j) => (
                        <span key={j}>{w}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white border border-bdr shadow-sm p-4 rounded-2xl">
                  <Loader2 className="w-5 h-5 animate-spin text-blue" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggested questions */}
      {suggestedQuestions.length > 0 && !isSending && messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestedQuestions.slice(0, 3).map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[12px] px-3 py-1.5 bg-blue/10 text-blue rounded-full border border-blue/20 hover:bg-blue/20 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-bdr bg-parch2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about vocabulary, grammar, or translation…"
            className="flex-1 px-4 py-3 bg-parch border border-bdr rounded-xl text-[14px] focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
            disabled={isSending || isLoadingMessages}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending || isLoadingMessages}
            className="px-4 py-3 bg-blue text-white rounded-xl hover:bg-blue/90 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
