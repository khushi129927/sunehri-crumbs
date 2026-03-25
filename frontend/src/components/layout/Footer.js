import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-obsidian border-t border-gold/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="w-6 h-6 text-gold" />
              <span className="font-serif text-2xl text-gold">Sunehri Crumbs</span>
            </div>
            <p className="text-ivory/50 text-sm leading-relaxed">
              Crafted with Care, Baked to Perfection. Experience the finest artisan bakery goods made with premium ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-gold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[{to:'/', label:'Home'},{to:'/menu', label:'Menu'},{to:'/booking', label:'Book a Table'},{to:'/gallery', label:'Gallery'},{to:'/reviews', label:'Reviews'},{to:'/contact', label:'Contact'}].map(l => (
                <Link key={l.to} to={l.to} className="text-ivory/50 text-sm hover:text-gold transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg text-gold mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-ivory/50 text-sm">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span>42 Baker Street, Mumbai 400001</span>
              </div>
              <div className="flex items-center gap-3 text-ivory/50 text-sm">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-ivory/50 text-sm">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>hello@sunehricrumbs.com</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-serif text-lg text-gold mb-4">Opening Hours</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3 text-ivory/50 text-sm">
                <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p>Mon - Fri: 7:00 AM - 10:00 PM</p>
                  <p>Sat - Sun: 8:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gold/10 pt-6 text-center">
          <p className="text-ivory/30 text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Sunehri Crumbs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
