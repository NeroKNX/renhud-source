interface HeaderProps {
  isConnected: boolean;
  userName: string;
  isGuest: boolean;
  onOpenHistory: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenSkills: () => void;
  onExport: () => void;
}

export function Header({ isConnected, userName, isGuest, onOpenHistory, onNewChat, onOpenSettings, onOpenSkills, onExport }: HeaderProps) {
  return (
    <header
      className="px-2 sm:px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between gap-2 sm:gap-4"
      style={{ backgroundColor: 'var(--ren-bg-header)', borderColor: 'var(--ren-border)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center overflow-hidden border border-[#4f46e5]/40 flex-shrink-0"
          style={{ backgroundColor: 'var(--ren-bg-tertiary)', boxShadow: `0 0 15px var(--ren-avatar-glow)` }}
        >
          <img src="/ren-avatar.png" alt="Ren" className="w-full h-full object-cover brightness-125" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-mono tracking-tight text-gray-100 flex items-center gap-2">
            Ren
            <span className={`inline-block w-2 h-2 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.5)] ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </h1>
          <span
            className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-mono"
            style={{ backgroundColor: 'var(--ren-accent-bg)', color: 'var(--ren-accent-text)', borderColor: 'var(--ren-accent-border)', borderWidth: '1px' }}
          >
            {isGuest ? 'Invitado' : `& ${userName}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={onOpenSkills} className="p-1.5 sm:p-2 hover:bg-[var(--ren-bg-hover)] border border-transparent hover:border-[var(--ren-border-light)] rounded-lg transition-colors text-gray-400 hover:text-gray-300" title="Skills">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 3.97-3.03Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-3.97-3.03Z"/>
          </svg>
        </button>
        <button onClick={onOpenHistory} className="p-1.5 sm:p-2 hover:bg-[var(--ren-bg-hover)] border border-transparent hover:border-[var(--ren-border-light)] rounded-lg transition-colors text-gray-400 hover:text-gray-300" title="Historial (Ctrl+H)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
          </svg>
        </button>
        <button onClick={onNewChat} className="p-1.5 sm:p-2 hover:bg-[var(--ren-bg-hover)] border border-transparent hover:border-[var(--ren-border-light)] rounded-lg transition-colors text-gray-400 hover:text-gray-300" title="Nuevo chat (Ctrl+K)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button onClick={onExport} className="p-1.5 sm:p-2 hover:bg-[var(--ren-bg-hover)] border border-transparent hover:border-[var(--ren-border-light)] rounded-lg transition-colors text-gray-400 hover:text-gray-300" title="Exportar (Ctrl+E)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <a href="/notes.html" target="_blank" className="p-1.5 sm:p-2 hover:bg-[var(--ren-bg-hover)] border border-transparent hover:border-[var(--ren-border-light)] rounded-lg transition-colors text-gray-400 hover:text-gray-300" title="Notas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
        </a>
        <button onClick={onOpenSettings} className="p-1.5 sm:p-2 hover:bg-[var(--ren-bg-hover)] border border-transparent hover:border-[var(--ren-border-light)] rounded-lg transition-colors text-gray-400 hover:text-gray-300" title="Configuración">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
