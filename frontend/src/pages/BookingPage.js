import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Users, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

export default function BookingPage() {
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', guests: 2 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/bookings`, form);
      toast.success('Booking confirmed!');
      setSuccess(true);
      setForm({ name: '', phone: '', date: '', time: '', guests: 2 });
    } catch {
      toast.error('Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="booking-page" className="pt-20 min-h-screen bg-cream">
      <div className="py-16 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium mb-3">Reserve</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-coffee">Book a Table</h1>
        <p className="text-charcoal/50 mt-4 max-w-lg mx-auto">Secure your spot at Sunehri Crumbs for an unforgettable dining experience.</p>
      </div>

      <div className="max-w-xl mx-auto px-6 pb-24">
        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="soft-card p-10 text-center shadow-soft-lg" data-testid="booking-success">
            <div className="w-14 h-14 mx-auto mb-4 bg-sage/20 rounded-2xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-sage-dark" />
            </div>
            <h2 className="font-serif text-2xl text-coffee mb-3">Booking Confirmed!</h2>
            <p className="text-charcoal/50 text-sm mb-6">We look forward to welcoming you at Sunehri Crumbs.</p>
            <button onClick={() => setSuccess(false)} className="text-coffee text-sm uppercase tracking-[0.15em] font-medium hover:text-sage-dark transition-colors">
              Make Another Booking
            </button>
          </motion.div>
        ) : (
          <motion.form onSubmit={handleSubmit} initial="hidden" animate="visible" className="soft-card p-8 space-y-6" data-testid="booking-form">
            <motion.div variants={fadeUp} custom={0}>
              <label className="text-xs uppercase tracking-[0.12em] text-coffee/70 font-medium mb-2 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} data-testid="booking-name-input"
                className="w-full bg-beige/30 border border-coffee/10 text-charcoal rounded-xl py-3 px-4 focus:border-coffee/30 focus:outline-none focus:ring-2 focus:ring-coffee/5 transition-all placeholder:text-charcoal/25" placeholder="Your name" />
            </motion.div>
            <motion.div variants={fadeUp} custom={1}>
              <label className="text-xs uppercase tracking-[0.12em] text-coffee/70 font-medium mb-2 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} data-testid="booking-phone-input"
                className="w-full bg-beige/30 border border-coffee/10 text-charcoal rounded-xl py-3 px-4 focus:border-coffee/30 focus:outline-none focus:ring-2 focus:ring-coffee/5 transition-all placeholder:text-charcoal/25" placeholder="+91 98765 43210" />
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div variants={fadeUp} custom={2}>
                <label className="text-xs uppercase tracking-[0.12em] text-coffee/70 font-medium mb-2 flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} data-testid="booking-date-input"
                  className="w-full bg-beige/30 border border-coffee/10 text-charcoal rounded-xl py-3 px-4 focus:border-coffee/30 focus:outline-none focus:ring-2 focus:ring-coffee/5 transition-all" />
              </motion.div>
              <motion.div variants={fadeUp} custom={3}>
                <label className="text-xs uppercase tracking-[0.12em] text-coffee/70 font-medium mb-2 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Time</label>
                <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} data-testid="booking-time-input"
                  className="w-full bg-beige/30 border border-coffee/10 text-charcoal rounded-xl py-3 px-4 focus:border-coffee/30 focus:outline-none focus:ring-2 focus:ring-coffee/5 transition-all" />
              </motion.div>
            </div>
            <motion.div variants={fadeUp} custom={4}>
              <label className="text-xs uppercase tracking-[0.12em] text-coffee/70 font-medium mb-2 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Guests</label>
              <input type="number" min="1" max="20" value={form.guests} onChange={e => setForm({...form, guests: parseInt(e.target.value) || 1})} data-testid="booking-guests-input"
                className="w-full bg-beige/30 border border-coffee/10 text-charcoal rounded-xl py-3 px-4 focus:border-coffee/30 focus:outline-none focus:ring-2 focus:ring-coffee/5 transition-all" />
            </motion.div>
            <motion.div variants={fadeUp} custom={5}>
              <button type="submit" disabled={submitting} data-testid="booking-submit-button"
                className="w-full bg-coffee text-cream font-semibold py-3.5 rounded-full hover:bg-sage transition-all duration-300 disabled:opacity-50 mt-2">
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </motion.div>
          </motion.form>
        )}
      </div>
    </div>
  );
}
