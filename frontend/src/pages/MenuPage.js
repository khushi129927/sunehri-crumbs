import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATEGORIES = ['All', 'Breads', 'Pastries', 'Donuts', 'Cakes', 'Beverages'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const { addItem, setTableNumber, tableNumber } = useCart();

  useEffect(() => {
    const table = searchParams.get('table');
    if (table) setTableNumber(parseInt(table));
  }, [searchParams, setTableNumber]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'All') params.category = category;
    if (search) params.search = search;
    axios.get(`${API}/menu`, { params })
      .then(r => setItems(r.data))
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [category, search]);

  const handleAddToCart = (item) => {
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div data-testid="menu-page" className="pt-20 min-h-screen bg-cream">
      {/* Header */}
      <div className="py-16 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium mb-3">Our Selection</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-coffee mb-4">The Menu</h1>
        {tableNumber && (
          <div data-testid="table-indicator" className="inline-flex items-center gap-2 bg-sage/20 border border-sage/30 px-4 py-2 rounded-full mt-4">
            <ShoppingCart className="w-4 h-4 text-sage-dark" />
            <span className="text-charcoal text-sm">Ordering for <span className="text-coffee font-semibold">Table {tableNumber}</span></span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-10">
          <div className="flex flex-wrap gap-2" data-testid="category-filters">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                data-testid={`category-${c.toLowerCase()}`}
                className={`text-xs uppercase tracking-[0.12em] font-medium px-5 py-2.5 rounded-full border transition-all duration-300 ${
                  category === c
                    ? 'bg-coffee text-cream border-coffee'
                    : 'bg-white text-charcoal/50 border-coffee/10 hover:border-coffee/30 hover:text-coffee'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="menu-search-input"
              className="w-full bg-white border border-coffee/10 text-charcoal text-sm pl-11 pr-4 py-2.5 rounded-full focus:border-coffee/30 focus:outline-none focus:ring-2 focus:ring-coffee/5 transition-all placeholder:text-charcoal/30"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="soft-card overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-3 skeleton w-16" />
                  <div className="h-5 skeleton w-3/4" />
                  <div className="h-4 skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-charcoal/40 text-lg">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <motion.div key={item.id} variants={fadeUp} custom={i} initial="hidden" animate="visible"
                className="soft-card overflow-hidden group" data-testid={`menu-item-${item.id}`}>
                <div className="img-zoom aspect-[4/3] relative">
                  <img src={item.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  {item.is_signature && (
                    <span className="absolute top-3 left-3 bg-coffee text-cream text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">Signature</span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.12em] text-sage-dark font-medium mb-1">{item.category}</p>
                  <h3 className="font-serif text-lg text-charcoal mb-1">{item.name}</h3>
                  <p className="text-charcoal/40 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-coffee font-semibold text-lg">${item.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      data-testid={`add-to-cart-${item.id}`}
                      className="flex items-center gap-1.5 bg-coffee text-cream text-xs font-semibold px-4 py-2 rounded-full hover:bg-sage transition-all duration-300"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
