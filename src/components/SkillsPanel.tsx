import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserId } from '@/utils/store';

interface Skill { id: string; name: string; instructions: string; createdAt: string; }
interface SkillsPanelProps { isOpen: boolean; onClose: () => void; activeSkillId: string | null; onActivate: (skillId: string | null, skillName?: string) => void; }

export function SkillsPanel({ isOpen, onClose, activeSkillId, onActivate }: SkillsPanelProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  const loadSkills = () => {
    fetch(`/api/skills?user_id=${getUserId()}`).then(r => r.json()).then(d => setSkills(d.skills || [])).catch(() => {});
  };

  useEffect(() => { if (isOpen) loadSkills(); }, [isOpen]);

  const createSkill = async () => {
    if (!newName.trim() || !newInstructions.trim()) return;
    await fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: getUserId(), name: newName, instructions: newInstructions }) });
    setNewName(''); setNewInstructions(''); setIsCreating(false); loadSkills();
  };

  const deleteSkill = async (id: string) => {
    await fetch(`/api/skills/${id}?user_id=${getUserId()}`, { method: 'DELETE' });
    if (activeSkillId === id) onActivate(null); loadSkills();
  };

  const bgVar = 'var(--ren-bg-primary)';
  const borderVar = 'var(--ren-border-light)';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
              className="border rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--ren-bg-panel)', borderColor: 'var(--ren-border)' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-mono text-gray-100">Skills</h2>
                <button onClick={onClose} className="p-1.5 hover:bg-[var(--ren-bg-hover-strong)] rounded-lg transition-colors text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {skills.length === 0 && !isCreating && <p className="text-sm font-mono text-gray-500 mb-4">No tenés skills creadas aún.</p>}

              <div className="space-y-2 mb-4">
                {skills.map(skill => (
                  <div key={skill.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      activeSkillId === skill.id ? 'bg-[#4f46e5]/10 border-[#4f46e5]' : 'hover:border-[#4f46e5]/50'
                    }`}
                    style={activeSkillId !== skill.id ? { backgroundColor: bgVar, borderColor: borderVar } : undefined}
                    onClick={() => onActivate(activeSkillId === skill.id ? null : skill.id, activeSkillId === skill.id ? undefined : skill.name)}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-gray-200 truncate">{skill.name}</p>
                      <p className="text-xs font-mono text-gray-500 truncate">{skill.instructions.slice(0, 60)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {activeSkillId === skill.id && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>}
                      <button onClick={e => { e.stopPropagation(); deleteSkill(skill.id); }} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {isCreating ? (
                <div className="space-y-3">
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre de la skill"
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-gray-100 placeholder-gray-600 focus:border-[#4f46e5] outline-none"
                    style={{ backgroundColor: bgVar, borderColor: borderVar }} />
                  <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)} placeholder="Instrucciones: ¿qué debería hacer REN con esta skill activa?" rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-gray-100 placeholder-gray-600 focus:border-[#4f46e5] outline-none resize-none"
                    style={{ backgroundColor: bgVar, borderColor: borderVar }} />
                  <div className="flex gap-2">
                    <button onClick={createSkill} className="flex-1 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono text-sm rounded-lg transition-colors">Crear</button>
                    <button onClick={() => setIsCreating(false)} className="px-4 py-2 border font-mono text-sm rounded-lg text-gray-300"
                      style={{ backgroundColor: 'var(--ren-bg-hover)', borderColor: 'var(--ren-border-light)' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsCreating(true)}
                  className="w-full py-2.5 font-mono text-sm rounded-lg border border-dashed transition-colors flex items-center justify-center gap-2 text-gray-300 hover:bg-[var(--ren-bg-hover-strong)]"
                  style={{ backgroundColor: 'var(--ren-bg-hover)', borderColor: 'var(--ren-border-light)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nueva skill
                </button>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
