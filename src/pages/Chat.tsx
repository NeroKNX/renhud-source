import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Header } from '@/components/Header';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
import { LoadingDots } from '@/components/LoadingDots';
import { HistorySidebar } from '@/components/HistorySidebar';
import { TypingMessage } from '@/components/TypingMessage';
import { useSessions, type Message } from '@/hooks/useSessions';
import { sendChat, createSession as apiCreateSession } from '@/utils/api';
import { getUser, getUserId } from '@/utils/store';

export function ChatPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    loaded,
    createSession,
    updateSession,
    removeSession,
    renameSession,
    toggleFavorite,
    getSession,
    logout,
  } = useSessions();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isDeep, setIsDeep] = useState(false);
  const [hasGeneratedWelcome, setHasGeneratedWelcome] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check connection
  useEffect(() => {
    const check = () => {
      fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(5000) })
        .then(r => setIsConnected(r.ok))
        .catch(() => setIsConnected(false));
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check auth
  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setUserName(user.name || 'Usuario');
    setIsGuestMode(user.isGuest === true);
    // Apply dark theme
    document.documentElement.classList.add('dark');
  }, [navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleNewSession();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsHistoryOpen(true);
      }
      if (e.key === 'Escape' && isHistoryOpen) {
        setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isHistoryOpen]);

  // Load or create session
  useEffect(() => {
    if (!loaded) return;

    if (sessionId) {
      const session = getSession(sessionId);
      if (session) {
        setMessages(session.messages);
        setCurrentSessionId(session.id);
        setHasGeneratedWelcome(session.messages.length > 0);
      } else {
        navigate('/chat');
      }
    } else {
      const allSessions = sessions.length > 0 ? sessions : [];
      if (allSessions.length > 0) {
        const mostRecent = allSessions[0];
        setMessages(mostRecent.messages);
        setCurrentSessionId(mostRecent.id);
        setHasGeneratedWelcome(mostRecent.messages.length > 0);
        navigate(`/chat/${mostRecent.id}`, { replace: true });
      } else {
        const newSession = createSession();
        setMessages([]);
        setCurrentSessionId(newSession.id);
        setHasGeneratedWelcome(false);
        navigate(`/chat/${newSession.id}`, { replace: true });
      }
    }
  }, [loaded, sessionId]);

  // Save messages when they change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      updateSession(currentSessionId, messages);
    }
  }, [messages, currentSessionId]);

  // Auto-scroll
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, typingMessage]);

  // Auto-greeting
  useEffect(() => {
    if (!currentSessionId || messages.length > 0 || hasGeneratedWelcome || isTyping || !loaded) return;

    setHasGeneratedWelcome(true);
    setIsTyping(true);

    const timer = setTimeout(async () => {
      try {
        const data = await sendChat({
          message: '__INIT__',
          user_id: getUserId(),
          deep: false,
          history: [],
        });
        const welcome: Message = {
          id: Date.now().toString(),
          text: data.text || 'Hola.',
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcome]);
      } catch {
        setMessages([{
          id: Date.now().toString(),
          text: 'Backend no disponible.',
          isUser: false,
          timestamp: new Date().toISOString(),
        }]);
      }
      setIsTyping(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentSessionId, messages.length, hasGeneratedWelcome, isTyping, loaded]);

  const handleSendMessage = useCallback(async (text: string, deep: boolean) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const history = messages
      .filter(m => m.text)
      .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

    try {
      const data = await sendChat({
        message: text,
        user_id: getUserId(),
        deep,
        history,
      });
      if (data.text) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: data.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          isDeep: deep,
        };
        setTypingMessage(aiMsg);
      } else {
        setIsTyping(false);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Error de conexión. Intenta de nuevo.',
        isUser: false,
        timestamp: new Date().toISOString(),
      }]);
      setIsTyping(false);
    }
  }, [messages]);

  const handleTypingComplete = useCallback(() => {
    if (typingMessage) {
      setMessages(prev => [...prev, typingMessage]);
      setTypingMessage(null);
      setIsTyping(false);
    }
  }, [typingMessage]);

  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === messageId);
      if (idx === -1) return prev;
      const updated = [...prev.slice(0, idx), { ...prev[idx], text: newText }];
      // Regenerate response
      setTimeout(async () => {
        setIsTyping(true);
        const history = updated
          .filter(m => m.text)
          .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));
        try {
          const data = await sendChat({
            message: newText,
            user_id: getUserId(),
            deep: false,
            history: history.slice(0, -1),
          });
          if (data.text) {
            const aiMsg: Message = {
              id: (Date.now() + 1).toString(),
              text: data.text,
              isUser: false,
              timestamp: new Date().toISOString(),
            };
            setMessages(prev2 => [...prev2, aiMsg]);
          }
        } catch {}
        setIsTyping(false);
      }, 0);
      return updated;
    });
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (messages.length === 0) return;

    // Remove last AI message and regenerate
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last.isUser) return prev;
      const truncated = prev.slice(0, -1);
      const lastUser = truncated.filter(m => m.isUser).pop();
      if (!lastUser) return truncated;

      setTimeout(async () => {
        setIsTyping(true);
        const history = truncated
          .filter(m => m.text)
          .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));
        try {
          const data = await sendChat({
            message: lastUser.text,
            user_id: getUserId(),
            deep: isDeep,
            history: history.filter(_ => true), // all history including the one before last
          });
          if (data.text) {
            const aiMsg: Message = {
              id: (Date.now() + 1).toString(),
              text: data.text,
              isUser: false,
              timestamp: new Date().toISOString(),
              isDeep,
            };
            setTypingMessage(aiMsg);
          }
        } catch {
          setIsTyping(false);
        }
      }, 0);

      return truncated;
    });
  }, [messages, isDeep]);

  const handleNewSession = useCallback(() => {
    if (messages.length > 0 && !isGuestMode) {
      apiCreateSession().catch(() => {});
    }
    const newSess = createSession();
    setMessages([]);
    setCurrentSessionId(newSess.id);
    setHasGeneratedWelcome(false);
    setIsTyping(false);
    setTypingMessage(null);
    navigate(`/chat/${newSess.id}`, { replace: true });
  }, [messages, isGuestMode, createSession, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleSelectSession = useCallback((id: string) => {
    const session = getSession(id);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(id);
      setHasGeneratedWelcome(session.messages.length > 0);
      setIsTyping(false);
      setTypingMessage(null);
    }
  }, [getSession]);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-[#0f1018] overflow-hidden">
        <div className="w-full max-w-[860px] mx-auto flex flex-col h-dvh max-h-dvh">
          <Header
            isConnected={isConnected}
            userName={userName}
            isGuest={isGuestMode}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onNewChat={handleNewSession}
          />

          {/* Chat area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 ren-scrollbar"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#252942 transparent' }}
          >
            {messages.length === 0 && !isTyping ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 font-mono text-sm">Escribe un mensaje para empezar</p>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onEdit={msg.isUser ? (newText) => handleEditMessage(msg.id, newText) : undefined}
                    onRegenerate={
                      !msg.isUser && msg.id === messages[messages.length - 1]?.id
                        ? handleRegenerate
                        : undefined
                    }
                  />
                ))}
                {typingMessage && (
                  <TypingMessage
                    message={typingMessage}
                    onComplete={handleTypingComplete}
                  />
                )}
                {isTyping && !typingMessage && (
                  <div className="flex gap-2 items-start mb-4">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#0a0d14] flex items-center justify-center overflow-hidden border border-[#4f46e5]/40 flex-shrink-0"
                      style={{ boxShadow: '0 0 15px rgba(79,70,229,0.15)' }}
                    >
                      <img src="/ren-avatar.png" alt="Ren" className="w-full h-full object-cover brightness-125" />
                    </div>
                    <div className="px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-[#16192a] border border-[#1a1d2e]">
                      <LoadingDots />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isTyping}
            isDeep={isDeep}
            onToggleDeep={() => setIsDeep(d => !d)}
          />
        </div>
      </div>

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={removeSession}
        onRenameSession={renameSession}
      />
    </>
  );
}
