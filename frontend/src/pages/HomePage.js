import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Wheat, Gem, LeafyGreen, ArrowRight, Star, Quote } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' } })
};

export default function HomePage() {
  const [signatures, setSignatures] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get(`${API}/menu?signature=true`).then(r => setSignatures(r.data.slice(0, 4))).catch(() => {});
    axios.get(`${API}/reviews?approved_only=true`).then(r => setReviews(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section data-testid="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/2174069/pexels-photo-2174069.jpeg?auto=compress&w=1920" alt="bakery" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/70 to-obsidian" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-xs uppercase tracking-[0.3em] text-gold mb-6">
            Est. 2024 &mdash; Premium Artisan Bakery
          </motion.p>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-gold leading-tight mb-6">
            Luxury Bakery<br />Crafted with Perfection
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-ivory/60 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Crafted with Care, Baked to Perfection. Every loaf, every pastry, every sip — an experience in artisanal excellence.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" data-testid="hero-browse-menu" className="inline-flex items-center justify-center gap-2 bg-gold text-obsidian font-semibold px-8 py-3.5 border border-gold hover:bg-forest hover:text-gold transition-all duration-300 shadow-gold-glow">
              Browse Menu <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/menu" data-testid="hero-order-now" className="inline-flex items-center justify-center gap-2 bg-transparent border border-gold text-gold px-8 py-3.5 hover:bg-gold hover:text-obsidian transition-all duration-300">
              Order Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section data-testid="features-section" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-xs uppercase tracking-[0.2em] text-gold-light mb-3">Why Choose Us</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl sm:text-4xl lg:text-5xl text-gold">The Sunehri Promise</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Wheat, title: 'Freshly Baked', desc: 'Every item baked fresh daily at dawn, ensuring warmth and flavor in every bite.' },
              { icon: Gem, title: 'Artisan Quality', desc: 'Handcrafted by master bakers with decades of experience in the finest traditions.' },
              { icon: LeafyGreen, title: 'Premium Ingredients', desc: 'Sourced from the finest organic farms — pure butter, heritage grains, and natural flavors.' },
            ].map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="glass-card p-8 text-center group" data-testid={`feature-card-${i}`}>
                <div className="w-14 h-14 mx-auto mb-6 border border-gold/20 flex items-center justify-center text-gold group-hover:shadow-gold-glow transition-shadow duration-500">
                  <f.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl text-gold mb-3">{f.title}</h3>
                <p className="text-ivory/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Products */}
      {signatures.length > 0 && (
        <section data-testid="signature-section" className="py-24 px-6 bg-[rgba(255,255,255,0.01)]">
          <div className="max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
              <motion.p variants={fadeUp} custom={0} className="text-xs uppercase tracking-[0.2em] text-gold-light mb-3">Our Best</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl sm:text-4xl lg:text-5xl text-gold">Signature Collection</motion.h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {signatures.map((item, i) => (
                <motion.div key={item.id} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="glass-card overflow-hidden group" data-testid={`signature-item-${i}`}>
                  <div className="img-zoom aspect-[4/3]">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.15em] text-gold/60 mb-1">{item.category}</p>
                    <h3 className="font-serif text-lg text-ivory mb-1">{item.name}</h3>
                    <p className="text-gold font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/menu" data-testid="view-full-menu" className="inline-flex items-center gap-2 text-gold text-sm uppercase tracking-[0.15em] hover:text-gold-light transition-colors">
                View Full Menu <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Preview */}
      <section data-testid="about-section" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} custom={0} className="text-xs uppercase tracking-[0.2em] text-gold-light mb-3">Our Story</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl sm:text-4xl text-gold mb-6">A Legacy of Golden Perfection</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-ivory/50 leading-relaxed mb-4">
              Born from a passion for authentic baking, Sunehri Crumbs brings together traditional techniques with contemporary flavors. Every recipe has been perfected over generations.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-ivory/50 leading-relaxed">
              From our hand-laminated croissants to our 24-hour fermented sourdough, we believe in taking the time to create something truly exceptional.
            </motion.p>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="img-zoom rounded-sm overflow-hidden border border-gold/10">
            <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800" alt="bakery" className="w-full h-80 lg:h-[420px] object-cover" loading="lazy" />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section data-testid="testimonials-section" className="py-24 px-6 bg-[rgba(255,255,255,0.01)]">
          <div className="max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
              <motion.p variants={fadeUp} custom={0} className="text-xs uppercase tracking-[0.2em] text-gold-light mb-3">Testimonials</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl sm:text-4xl lg:text-5xl text-gold">What Our Guests Say</motion.h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((r, i) => (
                <motion.div key={r.id} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="glass-card p-8" data-testid={`testimonial-${i}`}>
                  <Quote className="w-8 h-8 text-gold/30 mb-4" />
                  <p className="text-ivory/60 text-sm leading-relaxed mb-6">{r.comment}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(r.rating)].map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <span className="text-gold text-xs font-medium ml-2">{r.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
