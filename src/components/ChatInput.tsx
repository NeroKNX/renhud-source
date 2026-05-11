import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (text: string, isDeep: boolean) => void;
  disabled?: boolean;
  isDeep: boolean;
  onToggleDeep: () => void;
}

export function ChatInput({ onSend, disabled, isDeep, onToggleDeep }: ChatInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text, isDeep);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-2 sm:px-4 md:px-6 py-3 border-t border-[#252942] bg-[#0a0d14]">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          {/* Deep toggle */}
          <button
            type="button"
            onClick={onToggleDeep}
            className={`p-1.5 sm:p-2 rounded-lg border text-[10px] sm:text-xs font-mono font-bold transition-all ${
              isDeep
                ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30 text-[#818cf8] shadow-[0_0_10px_rgba(79,70,229,0.15)]'
                : 'bg-[#16192a] border-[#1a1d2e] text-gray-500 hover:border-[#2d3250]'
            }`}
          >
            🧠
          </button>

          {/* Text input */}
          <div className="flex-1 bg-[#16192a] border border-[#1a1d2e] focus-within:border-[#4f46e5]/50 rounded-xl px-4 py-2.5 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Escribe un mensaje..."
              className="w-full bg-transparent text-xs sm:text-sm font-mono text-gray-100 placeholder-gray-500 outline-none"
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="p-2 sm:p-2.5 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white transition-colors shadow-[0_0_10px_rgba(79,70,229,0.3)] disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
