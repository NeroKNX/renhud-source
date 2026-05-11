import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { register } from '@/utils/api';
import { setUser } from '@/utils/store';

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register(username, email, password);
      setUser({ user_id: data.token, name: data.username, role: data.role });
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0f1018]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="mb-8 text-center">
          <div
            className="w-20 h-20 rounded-full bg-[#0a0d14] flex items-center justify-center overflow-hidden mx-auto mb-6 border-2 border-[#4f46e5]/40"
            style={{ boxShadow: '0 0 30px rgba(79,70,229,0.4)' }}
          >
            <img src="/ren-avatar.png" alt="Ren" className="w-full h-full object-cover brightness-125" />
          </div>
          <h1 className="text-2xl font-mono text-gray-100 mb-2">Crear cuenta</h1>
          <p className="text-sm text-gray-400 font-mono">Comienza tu experiencia con REN</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-[#16192a] border border-[#252942] rounded-2xl p-8 space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-400 font-mono">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Nombre</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre"
              required
              className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-600 focus:border-[#4f46e5] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-600 focus:border-[#4f46e5] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-600 focus:border-[#4f46e5] outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </motion.button>

          <p className="text-xs font-mono text-gray-500 text-center">
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-[#818cf8] hover:underline">Iniciar sesión</button>
          </p>
        </form>

        <a href="/notes.html" className="block mt-4 text-center text-xs font-mono text-gray-500 hover:text-gray-300">
          📝 Notas de REN
        </a>

        {/* Guest mode */}
        <div className="mt-3 text-center">
          <button
            onClick={() => {
              const guestId = 'guest_' + Math.random().toString(36).slice(2, 10);
              setUser({ user_id: guestId, isGuest: true, name: 'Invitado' });
              navigate('/chat');
            }}
            className="text-xs font-mono text-gray-500 hover:text-gray-300 underline underline-offset-4"
          >
            Continuar como invitado
          </button>
        </div>
      </motion.div>
    </div>
  );
}
