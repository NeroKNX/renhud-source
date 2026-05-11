import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FontSize = 'small' | 'medium' | 'large';
type Theme = 'dark' | 'light';

const FONT_SIZES: Record<FontSize, string> = { small: '12px', medium: '14px', large: '16px' };

interface SettingsPanelProps { isOpen: boolean; onClose: () => void; isConnected: boolean; }

export function SettingsPanel({ isOpen, onClose, isConnected }: SettingsPanelProps) {
  const [fontSize, setFontSize] = useState<FontSize>(() => (localStorage.getItem('ren_font_size') as FontSize) || 'medium');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('ren_theme') as Theme) || 'dark');

  useEffect(() => { if (isOpen) applyTheme(theme); }, [isOpen]);

  const applyTheme = (t: Theme) => {
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  };

  const handleFontSize = (size: FontSize) => { setFontSize(size); localStorage.setItem('ren_font_size', size); document.documentElement.style.fontSize = FONT_SIZES[size]; };
  const handleTheme = (t: Theme) => { setTheme(t); localStorage.setItem('ren_theme', t); applyTheme(t); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 md:w-96 flex flex-col border-l shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50"
            style={{ backgroundColor: 'var(--ren-bg-panel)', borderColor: 'var(--ren-border)' }}
          >
            <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--ren-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-mono text-gray-100">Configuración</h2>
                <button onClick={onClose} className="p-2 hover:bg-[var(--ren-bg-hover-strong)] rounded-lg transition-colors text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-mono text-gray-400">{isConnected ? 'Conectado' : 'Sin conexión'}</span>
              </div>

              <div className="border-t" style={{ borderColor: 'var(--ren-border)' }} />

              <div>
                <label className="text-sm font-mono text-gray-300 block mb-3">Tamaño de fuente</label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                    <button key={size} onClick={() => handleFontSize(size)}
                      className={`flex-1 py-2 rounded-lg border font-mono text-xs transition-all ${
                        fontSize === size ? 'bg-[#4f46e5] border-[#4f46e5] text-white' : 'border-[var(--ren-border-light)] text-gray-400 hover:border-[#4f46e5]/50'
                      }`}
                      style={fontSize !== size ? { backgroundColor: 'var(--ren-bg-primary)' } : undefined}
                    >{size === 'small' ? 'Chica' : size === 'medium' ? 'Mediana' : 'Grande'}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-mono text-gray-300 block mb-3">Tema</label>
                <div className="flex gap-2">
                  <button onClick={() => handleTheme('dark')}
                    className={`flex-1 py-2 rounded-lg border font-mono text-xs transition-all flex items-center justify-center gap-2 ${
                      theme === 'dark' ? 'bg-[#4f46e5] border-[#4f46e5] text-white' : 'border-[var(--ren-border-light)] text-gray-400 hover:border-[#4f46e5]/50'
                    }`}
                    style={theme !== 'dark' ? { backgroundColor: 'var(--ren-bg-primary)' } : undefined}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    Oscuro
                  </button>
                  <button onClick={() => handleTheme('light')}
                    className={`flex-1 py-2 rounded-lg border font-mono text-xs transition-all flex items-center justify-center gap-2 ${
                      theme === 'light' ? 'bg-[#4f46e5] border-[#4f46e5] text-white' : 'border-[var(--ren-border-light)] text-gray-400 hover:border-[#4f46e5]/50'
                    }`}
                    style={theme !== 'light' ? { backgroundColor: 'var(--ren-bg-primary)' } : undefined}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    Claro
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
