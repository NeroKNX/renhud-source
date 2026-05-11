import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import type { ChatSession } from '@/hooks/useSessions';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function HistorySidebar({ isOpen, onClose, sessions, currentSessionId, onSelectSession, onDeleteSession, onRenameSession, onToggleFavorite }: HistorySidebarProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = sessions
    .filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleSelect = (id: string) => {
    onSelectSession(id);
    navigate(`/chat/${id}`);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta conversación?')) {
      onDeleteSession(id);
      if (currentSessionId === id) navigate('/chat');
    }
  };

  const handleStartEdit = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) onRenameSession(id, editTitle.trim());
    setEditingId(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 bottom-0 w-80 md:w-96 flex flex-col bg-[#16192a] border-r border-[#252942] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="px-5 py-6 border-b border-[#252942]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-mono text-gray-100">Historial</h2>
                <button onClick={onClose} className="p-2 hover:bg-[#1e2238] rounded-lg transition-colors text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg pl-10 pr-4 py-2 text-sm font-mono text-gray-100 placeholder-gray-600 focus:border-[#4f46e5] outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto ren-scrollbar">
              {filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-sm text-gray-500 font-mono">
                    {search ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
                  </p>
                </div>
              ) : (
                filtered.map(session => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`px-5 py-3 border-b border-[#1e2238] hover:bg-[#1a1d2e] cursor-pointer transition-colors ${
                      currentSessionId === session.id ? 'bg-[#1e2238]' : ''
                    }`}
                    onClick={() => handleSelect(session.id)}
                  >
                    {editingId === session.id ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(session.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onBlur={() => handleSaveEdit(session.id)}
                          autoFocus
                          className="w-full bg-[#0f1018] border border-[#4f46e5] rounded px-2 py-1 text-sm text-gray-100 font-mono outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {session.isFavorite && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" strokeWidth="2" className="flex-shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            )}
                            <p className="text-sm font-mono text-gray-200 truncate">
                              {session.title}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleFavorite(session.id); }}
                              className={`p-1 hover:bg-[#2d3250] rounded transition-colors ${session.isFavorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                              title={session.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill={session.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </button>
                            <button
                              onClick={(e) => handleStartEdit(e, session)}
                              className="p-1 hover:bg-[#2d3250] rounded text-gray-500 hover:text-gray-300"
                              title="Renombrar"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, session.id)}
                              className="p-1 hover:bg-[#2d3250] rounded text-gray-500 hover:text-red-400"
                              title="Eliminar"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs font-mono text-gray-500">{session.messages.length} mensajes</span>
                          <span className="text-xs font-mono text-gray-600">{formatDate(session.updatedAt)}</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
