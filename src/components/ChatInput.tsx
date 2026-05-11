import { useState, useRef, useEffect } from 'react';

interface FileAttachment {
  name: string;
  type: string;
  data: string;
}

interface ChatInputProps {
  onSend: (text: string, isDeep: boolean, files?: FileAttachment[]) => void;
  disabled?: boolean;
  isDeep: boolean;
  onToggleDeep: () => void;
}

export function ChatInput({ onSend, disabled, isDeep, onToggleDeep }: ChatInputProps) {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => {
      const ok = f.type.startsWith('image/') || f.type.startsWith('audio/') ||
        f.type.startsWith('video/') || f.type === 'application/pdf' || f.type.startsWith('text/');
      return ok && f.size <= 50 * 1024 * 1024;
    });
    setAttachedFiles(prev => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (i: number) => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i));

  const convertFiles = async (files: File[]): Promise<FileAttachment[]> => {
    return Promise.all(files.map(f =>
      new Promise<FileAttachment>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({ name: f.name, type: f.type, data: base64 });
        };
        reader.onerror = reject;
        reader.readAsDataURL(f);
      })
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && attachedFiles.length === 0) || disabled) return;
    let fileAttachments: FileAttachment[] | undefined;
    if (attachedFiles.length > 0) fileAttachments = await convertFiles(attachedFiles);
    onSend(text, isDeep, fileAttachments);
    setText('');
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  return (
    <div className="px-2 sm:px-4 md:px-6 py-3 border-t" style={{ backgroundColor: 'var(--ren-bg-header)', borderColor: 'var(--ren-border)' }}>
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 border rounded-lg text-xs font-mono text-gray-300" style={{ backgroundColor: 'var(--ren-bg-hover)', borderColor: 'var(--ren-border-light)' }}>
              {file.type.startsWith('image/') ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              ) : file.type.startsWith('audio/') ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              ) : file.type.startsWith('video/') ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              )}
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="p-0.5 hover:bg-[var(--ren-border-light)] rounded">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,audio/*,video/*,.pdf,.txt" multiple onChange={handleFileSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled}
            className="p-1.5 sm:p-2 rounded-lg border border-transparent hover:border-[var(--ren-border-light)] text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            title="Adjuntar archivo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>

          <button type="button" onClick={onToggleDeep}
            className={`p-1.5 sm:p-2 rounded-lg border text-[10px] sm:text-xs font-mono font-bold transition-all ${
              isDeep ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30 text-[#818cf8] shadow-[0_0_10px_rgba(79,70,229,0.15)]'
                : 'border-[var(--ren-border-input)] text-gray-500 hover:border-[var(--ren-border-light)]'
            }`}
            style={!isDeep ? { backgroundColor: 'var(--ren-bg-input)' } : undefined}
          >🧠</button>

          <div className="flex-1 border rounded-xl px-4 py-2.5 transition-colors focus-within:border-[#4f46e5]/50"
            style={{ backgroundColor: 'var(--ren-bg-input)', borderColor: 'var(--ren-border-input)' }}>
            <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown} disabled={disabled}
              placeholder="Escribe un mensaje..."
              className="w-full bg-transparent text-xs sm:text-sm font-mono text-gray-100 placeholder-gray-500 outline-none" />
          </div>

          <button type="submit" disabled={(!text.trim() && attachedFiles.length === 0) || disabled}
            className="p-2 sm:p-2.5 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white transition-colors shadow-[0_0_10px_rgba(79,70,229,0.3)] disabled:opacity-30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
