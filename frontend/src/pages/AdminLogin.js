import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center px-6 bg-obsidian">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <UtensilsCrossed className="w-10 h-10 text-gold mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-gold">Admin Panel</h1>
          <p className="text-ivory/40 text-sm mt-2">Sunehri Crumbs Management</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 gold-glow" data-testid="admin-login-form">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-2 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} data-testid="admin-email-input"
              className="w-full bg-transparent border-b border-gold/30 text-ivory py-2.5 focus:border-gold focus:outline-none transition-colors placeholder:text-ivory/20" placeholder="admin@bakery.com" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-2 flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} data-testid="admin-password-input"
              className="w-full bg-transparent border-b border-gold/30 text-ivory py-2.5 focus:border-gold focus:outline-none transition-colors placeholder:text-ivory/20" placeholder="Enter password" />
          </div>
          <button type="submit" disabled={loading} data-testid="admin-login-button"
            className="w-full bg-gold text-obsidian font-semibold py-3.5 border border-gold hover:bg-forest hover:text-gold transition-all duration-300 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
