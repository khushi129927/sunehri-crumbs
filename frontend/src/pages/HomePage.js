import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Wheat, Gem, LeafyGreen, ArrowRight, Star, Quote } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
          <div className="absolute inset-0 bg-cream/85" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in">
          <p className="text-xs uppercase tracking-[0.3em] text-coffee/70 mb-6 font-medium">
            Est. 2024 &mdash; Premium Artisan Bakery
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-medium text-coffee leading-[1.1] mb-6">
            Luxury Bakery<br />Crafted with Perfection
          </h1>
          <p className="text-charcoal/70 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Crafted with Care, Baked to Perfection. Every loaf, every pastry, every sip — an experience in artisanal excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" data-testid="hero-browse-menu" className="inline-flex items-center justify-center gap-2 bg-coffee text-cream font-medium px-8 py-3.5 rounded-full hover:bg-sage transition-all duration-300 shadow-soft">
              Browse Menu <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/menu" data-testid="hero-order-now" className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border border-coffee/15 text-coffee px-8 py-3.5 rounded-full hover:bg-beige transition-all duration-300">
              Order Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section data-testid="features-section" className="py-24 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium mb-3">Why Choose Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-coffee">The Sunehri Promise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Wheat, title: 'Freshly Baked', desc: 'Every item baked fresh daily at dawn, ensuring warmth and flavor in every bite.' },
              { icon: Gem, title: 'Artisan Quality', desc: 'Handcrafted by master bakers with decades of experience in the finest traditions.' },
              { icon: LeafyGreen, title: 'Premium Ingredients', desc: 'Sourced from the finest organic farms — pure butter, heritage grains, and natural flavors.' },
            ].map((f, i) => (
              <div key={f.title} className="soft-card p-8 text-center group" data-testid={`feature-card-${i}`}>
                <div className="w-14 h-14 mx-auto mb-6 bg-beige rounded-2xl flex items-center justify-center text-coffee group-hover:bg-sage/20 transition-colors duration-400">
                  <f.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl text-coffee mb-3">{f.title}</h3>
                <p className="text-charcoal/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Products */}
      {signatures.length > 0 && (
        <section data-testid="signature-section" className="py-24 px-6 bg-beige/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium mb-3">Our Best</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-coffee">Signature Collection</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {signatures.map((item, i) => (
                <div key={item.id} className="soft-card overflow-hidden group" data-testid={`signature-item-${i}`}>
                  <div className="img-zoom aspect-[4/3]">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.15em] text-sage-dark font-medium mb-1">{item.category}</p>
                    <h3 className="font-serif text-lg text-charcoal mb-1">{item.name}</h3>
                    <p className="text-coffee font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/menu" data-testid="view-full-menu" className="inline-flex items-center gap-2 text-coffee text-sm uppercase tracking-[0.15em] font-medium hover:text-sage-dark transition-colors">
                View Full Menu <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Preview */}
      <section data-testid="about-section" className="py-24 px-6 bg-cream">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium mb-3">Our Story</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-coffee mb-6">A Legacy of Golden Perfection</h2>
            <p className="text-charcoal/60 leading-relaxed mb-4">
              Born from a passion for authentic baking, Sunehri Crumbs brings together traditional techniques with contemporary flavors. Every recipe has been perfected over generations.
            </p>
            <p className="text-charcoal/60 leading-relaxed">
              From our hand-laminated croissants to our 24-hour fermented sourdough, we believe in taking the time to create something truly exceptional.
            </p>
          </div>
          <div className="img-zoom overflow-hidden rounded-2xl shadow-soft-lg">
            <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800" alt="bakery" className="w-full h-80 lg:h-[420px] object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section data-testid="testimonials-section" className="py-24 px-6 bg-beige/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium mb-3">Testimonials</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-coffee">What Our Guests Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((r, i) => (
                <div key={r.id} className="soft-card p-8" data-testid={`testimonial-${i}`}>
                  <Quote className="w-8 h-8 text-beige-dark mb-4" />
                  <p className="text-charcoal/60 text-sm leading-relaxed mb-6">{r.comment}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(r.rating)].map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-coffee text-coffee" />
                      ))}
                    </div>
                    <span className="text-coffee text-xs font-semibold ml-2">{r.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
