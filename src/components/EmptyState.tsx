interface EmptyStateProps {
  isGuest?: boolean;
}

const SUGGESTIONS = [
  { title: 'Análisis clínico', text: 'Analiza estos gases' },
  { title: 'Historia clínica', text: 'Redacta cronología UCI' },
  { title: 'Diagnóstico', text: 'Interpreta este ECG' },
  { title: 'Laboratorio', text: 'Organiza estos labs' },
];

export function EmptyState({ isGuest }: EmptyStateProps) {
  const handleClick = (text: string) => {
    window.dispatchEvent(new CustomEvent('renSuggestion', { detail: text }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <h2 className="text-xl font-mono text-gray-300 mb-2">REN</h2>
      <p className="text-sm font-mono text-gray-500 mb-8 text-center max-w-md">
        Asistente clínico inteligente. Escribe un mensaje o proba una sugerencia.
      </p>

      {isGuest && (
        <div className="mb-6 px-4 py-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <p className="text-xs font-mono text-amber-400/90 text-center">
            Modo invitado. Tus conversaciones se guardan localmente.
          </p>
        </div>
      )}

      <div className="w-full max-w-lg space-y-2 mb-8">
        <p className="text-xs font-mono text-gray-500 mb-3 text-center">Sugerencias</p>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleClick(s.text)}
            className="w-full px-4 py-3 bg-[var(--ren-bg-hover)] hover:bg-[var(--ren-bg-hover-strong)] border border-[var(--ren-border-subtle)] hover:border-[#4f46e5]/50 rounded-lg transition-all group text-left"
            style={{ animation: `slideUp 0.4s ease-out ${i * 0.1}s both` }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--ren-bg-primary)] rounded-lg group-hover:bg-[#4f46e5]/10 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-[#818cf8] transition-colors">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 3.97-3.03Z"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-3.97-3.03Z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-mono text-gray-500 mb-0.5">{s.title}</p>
                <p className="text-sm font-mono text-gray-300 group-hover:text-gray-100 transition-colors">"{s.text}"</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
