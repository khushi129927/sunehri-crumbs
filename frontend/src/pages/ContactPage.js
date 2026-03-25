import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/contacts`, form);
      toast.success('Message sent!');
      setSuccess(true);
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page" className="pt-20 min-h-screen">
      <div className="py-16 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-light mb-3">Get in Touch</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-gold">Contact Us</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <motion.div initial="hidden" animate="visible" className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl text-gold mb-6">Visit Our Bakery</h3>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Address', value: '42 Baker Street, Mumbai 400001' },
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: Mail, label: 'Email', value: 'hello@sunehricrumbs.com' },
                ].map((item, i) => (
                  <motion.div key={item.label} variants={fadeUp} custom={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-1">{item.label}</p>
                      <p className="text-ivory/70 text-sm">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h4 className="font-serif text-lg text-gold mb-3">Opening Hours</h4>
              <div className="space-y-2 text-sm text-ivory/50">
                <div className="flex justify-between"><span>Monday — Friday</span><span className="text-ivory/70">7:00 AM — 10:00 PM</span></div>
                <div className="flex justify-between"><span>Saturday — Sunday</span><span className="text-ivory/70">8:00 AM — 11:00 PM</span></div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 text-center flex flex-col items-center justify-center" data-testid="contact-success">
              <Mail className="w-12 h-12 text-gold mb-4" />
              <h3 className="font-serif text-2xl text-gold mb-3">Message Sent!</h3>
              <p className="text-ivory/60 text-sm mb-6">We'll get back to you shortly.</p>
              <button onClick={() => setSuccess(false)} className="text-gold text-sm uppercase tracking-[0.15em] hover:text-gold-light transition-colors">
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <motion.form onSubmit={handleSubmit} initial="hidden" animate="visible" className="glass-card p-8 space-y-6" data-testid="contact-form">
              <motion.div variants={fadeUp} custom={0}>
                <label className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-2 block">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} data-testid="contact-name-input"
                  className="w-full bg-transparent border-b border-gold/30 text-ivory py-2.5 focus:border-gold focus:outline-none transition-colors placeholder:text-ivory/20" placeholder="Your name" />
              </motion.div>
              <motion.div variants={fadeUp} custom={1}>
                <label className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-2 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} data-testid="contact-email-input"
                  className="w-full bg-transparent border-b border-gold/30 text-ivory py-2.5 focus:border-gold focus:outline-none transition-colors placeholder:text-ivory/20" placeholder="your@email.com" />
              </motion.div>
              <motion.div variants={fadeUp} custom={2}>
                <label className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-2 block">Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} data-testid="contact-message-input"
                  className="w-full bg-transparent border border-gold/20 text-ivory p-3 text-sm focus:border-gold focus:outline-none transition-colors placeholder:text-ivory/20 resize-none" placeholder="How can we help?" />
              </motion.div>
              <motion.div variants={fadeUp} custom={3}>
                <button type="submit" disabled={submitting} data-testid="contact-submit-button"
                  className="w-full bg-gold text-obsidian font-semibold py-3.5 border border-gold hover:bg-forest hover:text-gold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </motion.div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
