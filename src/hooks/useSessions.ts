import { useState, useEffect, useCallback, useRef } from 'react';
import { getUser, isGuest, getUserId } from '@/utils/store';
import { getSessions, saveSessions, deleteSession as apiDeleteSession, createSession as apiCreateSession } from '@/utils/api';
import type { Session as ApiSession, Message as ApiMessage } from '@/utils/api';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  model?: string;
  isDeep?: boolean;
  files?: { name: string; type: string; data: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

const CACHE_KEY = 'ren_sessions_cache';
const CURRENT_KEY = 'ren_current_session';

function readCache(): ChatSession[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCache(sessions: ChatSession[]): void {
  if (isGuest()) return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(sessions));
}

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => readCache());
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    () => localStorage.getItem(CURRENT_KEY) || ''
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isGuest()) {
      setLoaded(true);
      return;
    }
    getSessions()
      .then(async (remote) => {
        if (remote.length > 0) {
          writeCache(remote);
          setSessions(remote);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    localStorage.setItem(CURRENT_KEY, currentSessionId);
  }, [currentSessionId]);

  const syncToServer = useCallback(async (sessionsToSync: ChatSession[]) => {
    if (isGuest()) return;
    try {
      await saveSessions(sessionsToSync);
    } catch { /* offline */ }
  }, []);

  const createSession = useCallback((): ChatSession => {
    const session: ChatSession = {
      id: Date.now().toString(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [session, ...sessions];
    writeCache(updated);
    setSessions(updated);
    setCurrentSessionId(session.id);
    syncToServer(updated);
    return session;
  }, [sessions, syncToServer]);

  const updateSession = useCallback((sessionId: string, messages: Message[]) => {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === sessionId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        messages,
        updatedAt: new Date().toISOString(),
        title: updated[idx].title === 'Nueva conversación' && messages.length > 0
          ? (messages.find(m => m.isUser)?.text.slice(0, 50) || 'Nueva conversación') + (messages.some(m => m.isUser && m.text.length > 50) ? '...' : '')
          : updated[idx].title,
      };
      writeCache(updated);
      syncToServer(updated);
      return updated;
    });
  }, [syncToServer]);

  const removeSession = useCallback(async (sessionId: string) => {
    if (!isGuest()) {
      apiDeleteSession(sessionId).catch(() => {});
    }
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      writeCache(updated);
      syncToServer(updated);
      return updated;
    });
    if (currentSessionId === sessionId) {
      setCurrentSessionId('');
      localStorage.removeItem(CURRENT_KEY);
    }
  }, [currentSessionId, syncToServer]);

  const renameSession = useCallback((sessionId: string, title: string) => {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === sessionId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], title };
      writeCache(updated);
      syncToServer(updated);
      return updated;
    });
  }, [syncToServer]);

  const toggleFavorite = useCallback((sessionId: string) => {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === sessionId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], isFavorite: !updated[idx].isFavorite };
      writeCache(updated);
      syncToServer(updated);
      return updated;
    });
  }, [syncToServer]);

  const getSession = useCallback((sessionId: string) => {
    return sessions.find(s => s.id === sessionId) || null;
  }, [sessions]);

  const logout = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CURRENT_KEY);
    localStorage.removeItem('ren_user');
    setSessions([]);
    setCurrentSessionId('');
  }, []);

  return {
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
  };
}
