import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import type { Message } from '@/hooks/useSessions';

marked.setOptions({ breaks: true, gfm: true });

interface MessageBubbleProps {
  message: Message;
  onEdit?: (newText: string) => void;
  onRegenerate?: () => void;
}

export function MessageBubble({ message, onEdit, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showActions) return;
    const handler = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) setShowActions(false);
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showActions]);

  useEffect(() => {
    if (!contentRef.current || message.isUser) return;
    const pres = contentRef.current.querySelectorAll('pre');
    pres.forEach(pre => {
      if (pre.querySelector('.code-copy-btn')) return;
      const code = pre.querySelector('code');
      if (!code) return;
      pre.style.position = 'relative';
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      btn.title = 'Copiar código';
      btn.onclick = (e) => {
        e.stopPropagation();
        const txt = code.textContent || '';
        navigator.clipboard?.writeText(txt).catch(() => {
          const ta = document.createElement('textarea'); ta.value = txt;
          ta.style.position = 'fixed'; ta.style.left = '-9999px';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta);
        });
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
        setTimeout(() => { btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'; }, 2000);
      };
      pre.appendChild(btn);
    });
  }, [message.text, message.isUser]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(message.text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch {
      const ta = document.createElement('textarea'); ta.value = message.text;
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta); setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderMarkdown = (text: string) => { if (!text) return ''; try { return marked.parse(text) as string; } catch { return text; } };

  const formatTime = (ts: string) => {
    const date = new Date(ts); const now = new Date();
    const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 2) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `Hace ${diffHr}h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const htmlContent = renderMarkdown(message.text);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex gap-1.5 sm:gap-2 ${message.isUser ? 'justify-end' : 'justify-start'} mb-2 sm:mb-2.5 group`}
    >
      {!message.isUser && (
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center overflow-hidden border border-[#4f46e5]/40 flex-shrink-0"
          style={{ backgroundColor: 'var(--ren-bg-tertiary)', boxShadow: `0 0 15px var(--ren-avatar-glow)` }}
        >
          <img src="/ren-avatar.png" alt="Ren" className="w-full h-full object-cover brightness-125" />
        </div>
      )}

      <div className={`relative flex flex-col max-w-[88%] sm:max-w-[82%] md:max-w-[68%] min-w-0 ${message.isUser ? 'items-end' : 'items-start'}`}>
        <div
          ref={bubbleRef}
          onClick={() => setShowActions(v => !v)}
          className={`relative px-3 sm:px-3.5 py-1.5 sm:py-2 font-mono transition-all min-w-0 cursor-pointer active:scale-[0.98] hover:brightness-110 ${
            message.isUser
              ? 'bg-[#252942] text-gray-100 rounded-2xl rounded-br-sm ring-1 ring-[#4f46e5]/20'
              : message.isDeep
                ? 'bg-gradient-to-br from-[#1a1d30] to-[#16192a] text-gray-200 rounded-2xl rounded-bl-sm border-2 border-[#4f46e5]/40'
                : 'bg-gradient-to-br from-[#22253a] to-[#1c1f30] text-gray-200 rounded-2xl rounded-bl-sm border border-[var(--ren-border)]'
          }`}
        >
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {message.files.map((file, i) =>
                file.type.startsWith('image/') ? (
                  <img key={i} src={file.data} alt={file.name} className="max-w-full rounded-xl border border-[#2d3250] max-h-72 object-contain" />
                ) : file.type.startsWith('audio/') ? (
                  <audio key={i} controls className="w-full max-w-xs" src={file.data}>
                    <track kind="captions" />
                  </audio>
                ) : file.type.startsWith('video/') ? (
                  <video key={i} controls className="max-w-full rounded-xl border border-[#2d3250] max-h-72" src={file.data}>
                    <track kind="captions" />
                  </video>
                ) : (
                  <a key={i} href={file.data} download={file.name}
                    className="text-xs text-[#818cf8] hover:underline truncate max-w-[200px] border border-[#2d3250] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#1e2238] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {file.name}
                  </a>
                )
              )}
            </div>
          )}

          {/* Markdown rendered */}
          <div ref={contentRef} className="ren-content leading-[1.5] tracking-[0.01em] text-sm md:text-base text-gray-100" dangerouslySetInnerHTML={{ __html: htmlContent }} />

          {/* Footer */}
          <div className="flex items-end justify-between mt-1 sm:mt-1.5">
            <div className="leading-none">
              {message.timestamp && <span className="text-[9px] sm:text-[10px] text-gray-600/40">{formatTime(message.timestamp)}</span>}
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              {!message.isUser && message.isDeep && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-[#4f46e5]/12 border border-[#4f46e5]/20 rounded-full">
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 18v-5.25M12 10.5h.01M21.5 12a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0Z"/>
                  </svg>
                  <span className="text-[7px] sm:text-[8px] font-mono text-[#4f46e5] tracking-wider uppercase">DEEP</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className={`flex gap-1 mt-0.5 transition-all duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-0 sm:group-hover:opacity-100'}`}>
          <button onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="p-0.5 rounded text-gray-500/60 hover:text-[#818cf8] transition-colors active:scale-90" title="Copiar mensaje">
            {copied
              ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            }
          </button>
          {message.isUser && onEdit && (
            <button onClick={(e) => { e.stopPropagation(); const t = prompt('Editar mensaje:', message.text); if (t && t !== message.text) onEdit(t); }}
              className="p-0.5 rounded text-gray-500/60 hover:text-[#818cf8] transition-colors active:scale-90" title="Editar mensaje">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
          )}
          {!message.isUser && onRegenerate && (
            <button onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
              className="p-0.5 rounded text-gray-500/60 hover:text-[#818cf8] transition-colors active:scale-90" title="Regenerar">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.9M3.5 17A10 10 0 0022 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {message.isUser && (
        <div className="flex-shrink-0 self-end w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#2d3250] to-[#1e2238] border border-[#3d4260]/50 flex items-center justify-center shadow-sm">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-[13px] sm:h-[13px] md:w-[15px] md:h-[15px] text-gray-500">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}

      <style>{`
        .ren-content { font-size: inherit; line-height: 1.45; }
        .ren-content p { margin: 0.2em 0; }
        .ren-content p:first-child { margin-top: 0; }
        .ren-content p:last-child { margin-bottom: 0; }
        .ren-content strong { color: var(--ren-text-strong); font-weight: 700; }
        .ren-content em { color: var(--ren-text-em); }
        .ren-content ul, .ren-content ol { margin: 0.15em 0; padding-left: 1.2em; }
        .ren-content li { margin: 0.1em 0; line-height: 1.4; }
        .ren-content ul li { list-style: none; position: relative; }
        .ren-content ul li::before { content: "▸"; position: absolute; left: -1.1em; color: #818cf8; font-size: 0.9em; }
        .ren-content ol li { list-style-type: decimal; color: #d1d5db; }
        .ren-content ol li::marker { color: #818cf8; font-weight: 600; }
        .ren-content h1, .ren-content h2, .ren-content h3, .ren-content h4 { color: var(--ren-text-heading); font-weight: 700; margin: 0.4em 0 0.2em; line-height: 1.3; }
        .ren-content h1 { font-size: 1.05em; }
        .ren-content h2 { font-size: 1em; }
        .ren-content h3 { font-size: 0.95em; color: #a5b4fc; }
        .ren-content h4 { font-size: 0.9em; color: #c7d2fe; }
        .ren-content blockquote { border-left: 3px solid #818cf8; padding: 0.15em 0.6em; margin: 0.3em 0; color: var(--ren-text-blockquote); background: rgba(129,140,248,0.04); border-radius: 0 6px 6px 0; }
        .ren-content a { color: #818cf8; text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
        .ren-content a:hover { color: #a5b4fc; }
        .ren-content code { background: var(--ren-bg-code-inline); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.88em; font-family: 'Cascadia Code', 'JetBrains Mono', ui-monospace, monospace; color: var(--ren-text-code); border: 1px solid var(--ren-border-light); }
        .ren-content pre { background: var(--ren-bg-code); border: 1px solid var(--ren-border-subtle); border-radius: 8px; padding: 0.6em; overflow-x: auto; margin: 0.3em 0; position: relative; }
        .ren-content pre code { background: none; border: none; padding: 0; font-size: 0.85em; line-height: 1.5; color: #cbd5e1; white-space: pre-wrap; overflow-wrap: anywhere; display: block; font-family: 'Cascadia Code', 'JetBrains Mono', ui-monospace, monospace; }
        .ren-content table { border-collapse: collapse; margin: 0.6em 0; width: 100%; font-size: 0.88em; border-radius: 8px; overflow: hidden; }
        .ren-content th { background: var(--ren-bg-hover); color: var(--ren-text-heading); font-weight: 600; padding: 0.5em 0.7em; border: 1px solid var(--ren-border-light); text-align: left; }
        .ren-content td { color: #d1d5db; padding: 0.4em 0.7em; border: 1px solid var(--ren-border-light); }
        .ren-content tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
        .ren-content hr { border: none; height: 1px; background: linear-gradient(to right, transparent, var(--ren-border-light), transparent); margin: 0.5em 0; }
        .code-copy-btn { position: absolute; top: 6px; right: 6px; padding: 4px 6px; background: var(--ren-bg-hover); border: 1px solid var(--ren-border-light); border-radius: 6px; color: var(--ren-text-dim); cursor: pointer; opacity: 0; transition: all 0.2s; display: flex; align-items: center; justify-content: center; z-index: 1; }
        .ren-content pre:hover .code-copy-btn { opacity: 1; }
        .code-copy-btn:hover { border-color: #4f46e5; color: #e5e7eb; background: var(--ren-bg-hover-strong); }
      `}</style>
    </motion.div>
  );
}
