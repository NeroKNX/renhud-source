import { useState, useCallback, useRef } from 'react';
import { sendChat } from '@/utils/api';
import { getUserId } from '@/utils/store';
import type { Message } from './useSessions';

export function useChat() {
  const [isTyping, setIsTyping] = useState(false);
  const [isDeep, setIsDeep] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    text: string,
    history: Message[],
    deep: boolean,
  ): Promise<Message | null> => {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const chatHistory = history
        .filter(m => m.text)
        .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

      const data = await sendChat({
        message: text,
        user_id: getUserId(),
        deep,
        history: chatHistory,
        active_skill: '',
        files: null,
      });

      if (data.text) {
        return {
          id: (Date.now() + 1).toString(),
          text: data.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          isDeep: deep,
        };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return {
    isTyping,
    setIsTyping,
    isDeep,
    setIsDeep,
    sendMessage,
    cancelRequest,
  };
}
