import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Menu, X, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/booking', label: 'Book a Table' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav data-testid="navbar" className="fixed w-full z-50 bg-obsidian/80 backdrop-blur-xl border-b border-gold/10 px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group" data-testid="navbar-brand">
          <UtensilsCrossed className="w-6 h-6 text-gold transition-transform group-hover:rotate-12" />
          <span className="font-serif text-2xl font-medium text-gold tracking-tight">Sunehri Crumbs</span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`text-sm font-sans uppercase tracking-[0.15em] transition-colors duration-300 ${
                isActive(l.to) ? 'text-gold' : 'text-ivory/70 hover:text-gold'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/cart" data-testid="nav-cart-button" className="relative ml-2 text-ivory/70 hover:text-gold transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-obsidian text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          <Link to="/cart" data-testid="nav-cart-button-mobile" className="relative text-ivory/70 hover:text-gold transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-obsidian text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle" className="text-ivory">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-gold/10 mt-3"
          >
            <div className="flex flex-col py-4 gap-3">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`text-sm uppercase tracking-[0.15em] px-2 py-2 transition-colors ${
                    isActive(l.to) ? 'text-gold' : 'text-ivory/70 hover:text-gold'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
