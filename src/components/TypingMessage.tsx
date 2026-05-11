import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/hooks/useSessions';

interface TypingMessageProps {
  message: Message;
  onComplete: () => void;
}

export function TypingMessage({ message, onComplete }: TypingMessageProps) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    const text = message.text;
    if (!text) { onComplete(); return; }
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) { clearInterval(interval); onComplete(); }
    }, 20);
    return () => clearInterval(interval);
  }, [message.text, onComplete]);

  const showCursor = displayed.length < message.text.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-1.5 sm:gap-2 mb-4 items-start"
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center overflow-hidden border border-[#4f46e5]/40 flex-shrink-0"
        style={{ backgroundColor: 'var(--ren-bg-tertiary)', boxShadow: `0 0 15px var(--ren-avatar-glow)` }}
      >
        <img src="/ren-avatar.png" alt="Ren" className="w-full h-full object-cover brightness-125" />
      </div>
      <div className="flex-1 max-w-[88%] sm:max-w-[82%] md:max-w-[68%]">
        <div
          className="px-3 md:px-4 py-2.5 md:py-3 rounded-lg border text-gray-200 font-mono whitespace-pre-wrap rounded-bl-sm"
          style={{ backgroundColor: 'var(--ren-bg-secondary)', borderColor: message.isDeep ? '#4f46e5' : 'var(--ren-border-subtle)' }}
        >
          {message.isDeep && (
            <div className="mb-1 text-[7px] text-[#818cf8]">🧠 Deep</div>
          )}
          <span className="text-sm md:text-base">
            {displayed}
            {showCursor && <span className="typing-cursor" />}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
