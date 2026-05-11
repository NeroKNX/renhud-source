import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/hooks/useSessions';

interface TypingMessageProps {
  message: Message;
  onComplete: () => void;
}

export function TypingMessage({ message, onComplete }: TypingMessageProps) {
  const [displayed, setDisplayed] = useState('');
  const completedRef = useRef(false);

  useEffect(() => {
    const text = message.text;
    if (!text) {
      onComplete();
      return;
    }

    let idx = 0;
    const speed = 20; // ~20ms per char

    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));

      if (idx >= text.length) {
        clearInterval(interval);
        completedRef.current = true;
        onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [message.text, onComplete]);

  if (!displayed && message.text.length === 0) return null;

  const showCursor = displayed.length < message.text.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-1.5 sm:gap-2 mb-4 items-start"
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#0a0d14] flex items-center justify-center overflow-hidden border border-[#4f46e5]/40 flex-shrink-0"
        style={{ boxShadow: '0 0 15px rgba(79,70,229,0.15)' }}
      >
        <img src="/ren-avatar.png" alt="Ren" className="w-full h-full object-cover brightness-125" />
      </div>

      <div className={`flex-1 max-w-[88%] sm:max-w-[82%] md:max-w-[68%]`}>
        <div className={message.isDeep
          ? 'px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-[#16192a] border border-[#4f46e5] shadow-[0_0_20px_rgba(79,70,229,0.2)] ring-1 ring-[#4f46e5]/20 text-gray-200 font-mono whitespace-pre-wrap rounded-bl-sm'
          : 'px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-[#16192a] border border-[#1a1d2e] text-gray-200 font-mono whitespace-pre-wrap rounded-bl-sm'
        }>
          <span className="text-sm md:text-base">
            {displayed}
            {showCursor && <span className="typing-cursor" />}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
