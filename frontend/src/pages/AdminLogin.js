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
    } catch { toast.error('Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center px-6 bg-cream">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 bg-beige rounded-2xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-coffee" />
          </div>
          <h1 className="font-serif text-3xl text-coffee">Admin Panel</h1>
          <p className="text-charcoal/40 text-sm mt-2">Sunehri Crumbs Management</p>
        </div>
        <form onSubmit={handleSubmit} className="soft-card p-8 space-y-6 shadow-soft-lg" data-testid="admin-login-form">
          <div>
            <label className="text-xs uppercase tracking-[0.12em] text-coffee/70 font-medium mb-2 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} data-testid="admin-email-input"
              className="w-full bg-beige/30 border border-coffee/10 text-charcoal rounded-xl py-3 px-4 focus:border-coffee/30 focus:outline-none focus:ring-2 focus:ring-coffee/5 transition-all placeholder:text-charcoal/25" placeholder="admin@bakery.com" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.12em] text-coffee/70 font-medium mb-2 flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} data-testid="admin-password-input"
              className="w-full bg-beige/30 border border-coffee/10 text-charcoal rounded-xl py-3 px-4 focus:border-coffee/30 focus:outline-none focus:ring-2 focus:ring-coffee/5 transition-all placeholder:text-charcoal/25" placeholder="Enter password" />
          </div>
          <button type="submit" disabled={loading} data-testid="admin-login-button"
            className="w-full bg-coffee text-cream font-semibold py-3.5 rounded-full hover:bg-sage transition-all duration-300 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
