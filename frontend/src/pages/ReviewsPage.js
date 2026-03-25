import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    axios.get(`${API}/reviews?approved_only=true`)
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/reviews`, form);
      toast.success('Review submitted! It will appear after approval.');
      setForm({ name: '', rating: 5, comment: '' });
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="reviews-page" className="pt-20 min-h-screen">
      <div className="py-16 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-light mb-3">Voices</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-gold">Guest Reviews</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review Form */}
          <motion.div initial="hidden" animate="visible" className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 sticky top-24" data-testid="review-form">
              <h3 className="font-serif text-xl text-gold mb-2">Leave a Review</h3>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-2 block">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} data-testid="review-name-input"
                  className="w-full bg-transparent border-b border-gold/30 text-ivory py-2 focus:border-gold focus:outline-none transition-colors placeholder:text-ivory/20" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-2 block">Rating</label>
                <div className="flex gap-1" data-testid="review-rating">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setForm({...form, rating: s})} data-testid={`rating-star-${s}`}>
                      <Star className={`w-6 h-6 transition-colors ${s <= form.rating ? 'fill-gold text-gold' : 'text-ivory/20'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-2 block">Comment</label>
                <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} rows={4} data-testid="review-comment-input"
                  className="w-full bg-transparent border border-gold/20 text-ivory p-3 text-sm focus:border-gold focus:outline-none transition-colors placeholder:text-ivory/20 resize-none" placeholder="Share your experience..." />
              </div>
              <button type="submit" disabled={submitting} data-testid="review-submit-button"
                className="w-full bg-gold text-obsidian font-semibold py-3 border border-gold hover:bg-forest hover:text-gold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="glass-card p-6 space-y-3">
                  <div className="h-4 skeleton w-32 rounded" />
                  <div className="h-3 skeleton w-full rounded" />
                  <div className="h-3 skeleton w-3/4 rounded" />
                </div>
              ))
            ) : reviews.length === 0 ? (
              <div className="text-center py-16"><p className="text-ivory/40">No reviews yet. Be the first!</p></div>
            ) : (
              reviews.map((r, i) => (
                <motion.div key={r.id} variants={fadeUp} custom={i} initial="hidden" animate="visible"
                  className="glass-card p-6" data-testid={`review-item-${i}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-serif text-lg">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-ivory font-medium text-sm">{r.name}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(r.rating)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-gold text-gold" />
                        ))}
                        {[...Array(5 - r.rating)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 text-ivory/10" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-ivory/60 text-sm leading-relaxed">{r.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
