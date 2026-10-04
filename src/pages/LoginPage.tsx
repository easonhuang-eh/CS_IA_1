import { useState } from 'react';
import { useApp } from '../store';
import { motion } from 'framer-motion';
import { Gamepad2, GraduationCap, LogIn, UserPlus } from 'lucide-react';

export function LoginPage() {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (isLogin) {
      const success = login(name, password);
      if (!success) setError('Invalid credentials');
    } else {
      const success = register(name, password, role);
      if (!success) setError('Username already exists');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{
              y: [null, -20, 20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl mb-4"
          >
            <Gamepad2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">DoNow Arena</h1>
          <p className="text-purple-200 text-lg">Interactive Assessment Platform</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isLogin ? 'bg-white text-purple-900 shadow-lg' : 'text-white/70 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                !isLogin ? 'bg-white text-purple-900 shadow-lg' : 'text-white/70 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/80 text-sm font-medium mb-1 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm font-medium mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="text-white/80 text-sm font-medium mb-2 block">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === 'student'
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                  >
                    <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === 'teacher'
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                  >
                    <Gamepad2 className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Teacher</span>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-white/50 text-xs text-center mb-2">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-yellow-400 font-medium">Teacher:</p>
                  <p className="text-white/70">Mr. Thompson / teacher123</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-yellow-400 font-medium">Student:</p>
                  <p className="text-white/70">Alice Chen / student123</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
