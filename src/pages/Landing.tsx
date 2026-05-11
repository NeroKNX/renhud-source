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
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--ren-bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#4f46e5]/40"
            style={{ backgroundColor: 'var(--ren-bg-tertiary)', boxShadow: '0 0 40px rgba(79,70,229,0.4)' }}>
            <img src="/ren-avatar.png" alt="REN" className="w-full h-full object-cover brightness-125" />
          </div>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-mono text-gray-100 mb-3 tracking-tight">REN</h1>
        <p className="text-sm text-gray-400 font-mono mb-10">Asistente clínico inteligente</p>
        <div className="flex flex-col gap-3 w-64 mx-auto">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/login')}
            className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono text-sm rounded-lg transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            Iniciar sesión
          </motion.button>
          <button onClick={goGuest}
            className="w-full py-3 border font-mono text-sm rounded-lg transition-colors text-gray-400 hover:text-gray-300 hover:border-[#4f46e5]/50"
            style={{ borderColor: 'var(--ren-border-light)' }}>
            Continuar como invitado
          </button>
        </div>
        <div className="mt-8">
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono"
            style={{ backgroundColor: 'var(--ren-accent-bg)', color: 'var(--ren-accent-text)', borderColor: 'var(--ren-accent-border)', borderWidth: '1px' }}>
            & Nero
          </span>
        </div>
      </motion.div>
    </div>
  );
}
