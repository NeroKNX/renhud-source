import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Header } from '@/components/Header';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
import { LoadingDots } from '@/components/LoadingDots';
import { HistorySidebar } from '@/components/HistorySidebar';
import { TypingMessage } from '@/components/TypingMessage';
import { SettingsPanel } from '@/components/SettingsPanel';
import { SkillsPanel } from '@/components/SkillsPanel';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { useSessions, type Message } from '@/hooks/useSessions';
import { sendChat, createSession as apiCreateSession } from '@/utils/api';
import { getUser, getUserId } from '@/utils/store';

interface FileAttachment {
  name: string;
  type: string;
  data: string;
}

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [activeSkillName, setActiveSkillName] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
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
    document.documentElement.classList.add('dark');

    // Apply saved font size
    const fs = localStorage.getItem('ren_font_size');
    if (fs) {
      const sizes: Record<string, string> = { small: '12px', medium: '14px', large: '16px' };
      document.documentElement.style.fontSize = sizes[fs] || '14px';
    }

    // Apply saved theme
    const theme = localStorage.getItem('ren_theme') || 'dark';
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [navigate]);

  // Guest session limit warning
  useEffect(() => {
    if (isGuestMode) {
      const count = sessions.length;
      if (count >= 8 && count < 10) {
        setShowGuestWarning(true);
      } else if (count >= 10) {
        setShowGuestWarning(false);
      }
    }
  }, [isGuestMode, sessions]);

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteLastMessage();
      }
      if (e.key === 'Escape') {
        if (isHistoryOpen) setIsHistoryOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isSkillsOpen) setIsSkillsOpen(false);
        else if (isShortcutsOpen) setIsShortcutsOpen(false);
      }
      if (e.key === '?' && !(e.ctrlKey || e.metaKey) && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isHistoryOpen, isSettingsOpen, isSkillsOpen, isShortcutsOpen]);

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

  // Save messages
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      updateSession(currentSessionId, messages);
    }
  }, [messages, currentSessionId]);

  // Auto-scroll
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, typingMessage]);

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
          active_skill: activeSkillId || '',
          files: null,
        });
        setMessages([{
          id: Date.now().toString(),
          text: data.text || 'Hola.',
          isUser: false,
          timestamp: new Date().toISOString(),
        }]);
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
  }, [currentSessionId, messages.length, hasGeneratedWelcome, isTyping, loaded, activeSkillId]);

  const handleSendMessage = useCallback(async (text: string, deep: boolean, files?: FileAttachment[]) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
      files: files?.map(f => ({ name: f.name, type: f.type, data: `data:${f.type};base64,${f.data}` })),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const history = [...messages, { ...userMsg, files: undefined }]
      .filter(m => m.text)
      .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

    try {
      const data = await sendChat({
        message: text,
        user_id: getUserId(),
        deep,
        history,
        active_skill: activeSkillId || '',
        files: files || null,
      });
      if (data.text) {
        setTypingMessage({
          id: (Date.now() + 1).toString(),
          text: data.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          isDeep: deep,
        });
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
  }, [messages, activeSkillId]);

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
      setTimeout(async () => {
        setIsTyping(true);
        const history = updated.filter(m => m.text).map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));
        try {
          const data = await sendChat({
            message: newText,
            user_id: getUserId(),
            deep: false,
            history: history.slice(0, -1),
            active_skill: activeSkillId || '',
            files: null,
          });
          if (data.text) {
            setMessages(prev2 => [...prev2, { id: (Date.now() + 1).toString(), text: data.text, isUser: false, timestamp: new Date().toISOString() }]);
          }
        } catch {}
        setIsTyping(false);
      }, 0);
      return updated;
    });
  }, [activeSkillId]);

  const handleRegenerate = useCallback(async () => {
    if (messages.length === 0) return;
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last.isUser) return prev;
      const truncated = prev.slice(0, -1);
      const lastUser = truncated.filter(m => m.isUser).pop();
      if (!lastUser) return truncated;
      setTimeout(async () => {
        setIsTyping(true);
        const history = truncated.filter(m => m.text).map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));
        try {
          const data = await sendChat({
            message: lastUser.text,
            user_id: getUserId(),
            deep: isDeep,
            history,
            active_skill: activeSkillId || '',
            files: null,
          });
          if (data.text) setTypingMessage({ id: (Date.now() + 1).toString(), text: data.text, isUser: false, timestamp: new Date().toISOString(), isDeep });
        } catch { setIsTyping(false); }
      }, 0);
      return truncated;
    });
  }, [messages, isDeep, activeSkillId]);

  const handleDeleteLastMessage = useCallback(() => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      // Remove last message; if it was user message, also remove the AI response
      const last = prev[prev.length - 1];
      if (last.isUser) return prev.slice(0, -1);
      // Remove last two (AI + user pair)
      return prev.length >= 2 ? prev.slice(0, -2) : prev.slice(0, -1);
    });
  }, []);

  const handleNewSession = useCallback(() => {
    if (messages.length > 0 && !isGuestMode) {
      apiCreateSession().catch(() => {});
    }
    // Guest limit: delete oldest if at 10
    if (isGuestMode && sessions.length >= 10) {
      const oldest = [...sessions].sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())[0];
      removeSession(oldest.id);
    }
    const newSess = createSession();
    setMessages([]);
    setCurrentSessionId(newSess.id);
    setHasGeneratedWelcome(false);
    setIsTyping(false);
    setTypingMessage(null);
    navigate(`/chat/${newSess.id}`, { replace: true });
  }, [messages, isGuestMode, sessions, createSession, removeSession, navigate]);

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

  const handleActivateSkill = useCallback((skillId: string | null, skillName?: string) => {
    const activating = skillId && !activeSkillId;
    setActiveSkillId(skillId);
    setActiveSkillName(skillId ? (skillName || null) : null);
    setIsSkillsOpen(false);
    if (activating) {
      // Crear chat nuevo al activar skill
      const newSess = createSession();
      setMessages([]);
      setCurrentSessionId(newSess.id);
      setHasGeneratedWelcome(false);
      setIsTyping(false);
      setTypingMessage(null);
      navigate(`/chat/${newSess.id}`, { replace: true });
    }
  }, [activeSkillId, createSession, navigate]);

  const handleExport = useCallback(() => {
    if (messages.length === 0) return;
    const session = getSession(currentSessionId);
    const data = {
      ren_session_export: {
        version: 1,
        exportDate: new Date().toISOString(),
        session: session || { id: currentSessionId, title: 'Chat', messages, createdAt: '', updatedAt: '' },
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ren-chat-${currentSessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages, currentSessionId, getSession]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

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
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSkills={() => setIsSkillsOpen(true)}
            onExport={handleExport}
          />

          {/* Guest warning */}
          {isGuestMode && showGuestWarning && (
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
              <p className="text-xs font-mono text-amber-400/80 text-center">
                ⚠️ Tenés {sessions.length}/10 sesiones guardadas. Al crear más, se eliminará la más antigua.
              </p>
            </div>
          )}

          {/* Active skill badge */}
          {activeSkillName && (
            <div className="px-4 py-1.5 bg-[#4f46e5]/10 border-b border-[#4f46e5]/20 flex items-center gap-2">
              <span className="text-xs font-mono text-[#818cf8]">
                Skill: <strong>{activeSkillName}</strong>
              </span>
              <button onClick={() => handleActivateSkill(null)} className="ml-auto p-0.5 hover:bg-[#4f46e5]/20 rounded">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}

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
                    onRegenerate={!msg.isUser && msg.id === messages[messages.length - 1]?.id ? handleRegenerate : undefined}
                  />
                ))}
                {typingMessage && (
                  <TypingMessage message={typingMessage} onComplete={handleTypingComplete} />
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

          <ChatInput
            onSend={handleSendMessage}
            disabled={isTyping}
            isDeep={isDeep}
            onToggleDeep={() => setIsDeep(d => !d)}
          />
        </div>
      </div>

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={removeSession}
        onRenameSession={renameSession}
        onToggleFavorite={toggleFavorite}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isConnected={isConnected}
      />

      <SkillsPanel
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        activeSkillId={activeSkillId}
        onActivate={handleActivateSkill}
      />

      <KeyboardShortcutsHelp
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
}
