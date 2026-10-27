import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a1a]">
      {/* Animated Background Orbs */}
      <div className="bg-orb w-96 h-96 bg-violet-600 top-[-100px] left-[-100px]" style={{animationDelay: '0s'}} />
      <div className="bg-orb w-80 h-80 bg-pink-600 bottom-[-50px] right-[-50px]" style={{animationDelay: '3s'}} />
      <div className="bg-orb w-64 h-64 bg-cyan-600 bottom-[30%] left-[10%]" style={{animationDelay: '1.5s'}} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-500/40"
          >
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
          <p className="text-white/50 mt-1 text-sm">Sign in to your Pulse workspace</p>
        </div>

        {/* Card */}
        <div className="glass-dark gradient-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Features hint */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/25">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
            Pomodoro Timer
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
            Task Tracker
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            Analytics
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
