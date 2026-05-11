import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { setUser } from '@/utils/store';

export function LandingPage() {
  const navigate = useNavigate();

  const goGuest = () => {
    const guestId = 'guest_' + Math.random().toString(36).slice(2, 10);
    setUser({ user_id: guestId, isGuest: true, name: 'Invitado' });
    navigate('/chat');
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--ren-bg-primary)' }}>
      {/* Navigation */}
      <nav className="w-full border-b flex-shrink-0" style={{ borderColor: 'var(--ren-border-subtle)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center overflow-hidden border border-[#4f46e5]/30"
              style={{ backgroundColor: 'var(--ren-bg-tertiary)', boxShadow: '0 0 20px rgba(79,70,229,0.3)' }}>
              <img src="/ren-avatar.png" alt="Ren" className="w-full h-full object-cover" />
            </div>
            <span className="text-base md:text-lg font-mono text-gray-100 tracking-tight">REN</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-xs md:text-sm font-mono text-gray-400 hover:text-gray-100 transition-colors">
              Iniciar sesión
            </button>
            <button onClick={() => navigate('/register')} className="px-3 py-1.5 text-xs md:text-sm font-mono text-[#818cf8] hover:text-[#4f46e5] transition-colors">
              Crear cuenta
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-lg">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="flex justify-center mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#4f46e5]/40"
              style={{ backgroundColor: 'var(--ren-bg-tertiary)', boxShadow: '0 0 40px rgba(79,70,229,0.4)' }}>
              <img src="/ren-avatar.png" alt="REN" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-mono text-gray-100 mb-6">REN</h1>

          {/* CTA */}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={goGuest}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono rounded-lg transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 text-base mx-auto mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chatear ahora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </motion.button>

          <p className="text-xs text-gray-500 font-mono mb-8">Sin registro. Empieza al instante.</p>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-gray-500">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/></svg>
              Modelos flexibles
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Sin registro
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Privado
            </span>
          </div>
        </motion.div>
      </main>

      <footer className="border-t py-3 md:py-4 flex-shrink-0" style={{ borderColor: 'var(--ren-border-subtle)' }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600 font-mono">REN — 2026</p>
        </div>
      </footer>
    </div>
  );
}
