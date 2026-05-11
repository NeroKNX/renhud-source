import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Nuevo chat' },
  { keys: ['Ctrl', 'H'], description: 'Historial' },
  { keys: ['Ctrl', 'E'], description: 'Exportar sesión (JSON)' },
  { keys: ['Ctrl', 'Backspace'], description: 'Eliminar último mensaje' },
  { keys: ['Esc'], description: 'Cerrar panel' },
  { keys: ['?'], description: 'Mostrar atajos' },
];

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#16192a] border border-[#2d3250] rounded-xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg>
                <h2 className="text-lg font-mono text-gray-100">Atajos de teclado</h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-[#1e2238] rounded transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-2">
              {SHORTCUTS.map((sc, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-[#0f1018] rounded-lg border border-[#1e2238]">
                  <span className="text-sm font-mono text-gray-300">{sc.description}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((key, j) => (
                      <span key={j}>
                        <kbd className="px-2 py-0.5 text-xs font-mono bg-[#1a1d2e] text-gray-300 border border-[#2d3250] rounded">{key}</kbd>
                        {j < sc.keys.length - 1 && <span className="text-gray-500 mx-0.5">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs font-mono text-gray-500 text-center">
              Presiona <kbd className="px-1.5 py-0.5 bg-[#1a1d2e] border border-[#2d3250] rounded text-gray-400">?</kbd> para abrir esta ayuda
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
