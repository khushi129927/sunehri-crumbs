import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Plus, Minus, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATEGORIES = ['All', 'Breads', 'Pastries', 'Donuts', 'Cakes', 'Beverages'];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const { items: cartItems, addItem, updateQuantity, removeItem, setTableNumber, tableNumber, totalPrice, totalItems, clearCart } = useCart();

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

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find(i => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item) => {
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
  };

  const handleIncrement = (item) => {
    const quantity = getItemQuantity(item.id);
    if (quantity === 0) {
      handleAddToCart(item);
    } else {
      updateQuantity(item.id, quantity + 1);
    }
  };

  const handleDecrement = (itemId) => {
    const quantity = getItemQuantity(itemId);
    if (quantity > 1) {
      updateQuantity(itemId, quantity - 1);
    } else {
      removeItem(itemId);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Please add items to your order');
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total_price: totalPrice,
        table_number: tableNumber ? parseInt(tableNumber) : null,
      };
      const res = await axios.post(`${API}/orders`, orderData);
      clearCart();
      toast.success('Order placed successfully!');
      
      // Show success message and redirect after 2 seconds
      setTimeout(() => {
        if (tableNumber) {
          window.location.reload(); // Reload to allow another order
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div data-testid="menu-page" className="pt-20 min-h-screen bg-cream pb-32">
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

      <div className="max-w-7xl mx-auto px-6">
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
            {items.map((item) => {
              const quantity = getItemQuantity(item.id);
              return (
                <div key={item.id}
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
                      
                      {quantity === 0 ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          data-testid={`add-to-cart-${item.id}`}
                          className="flex items-center gap-1.5 bg-coffee text-cream text-xs font-semibold px-4 py-2 rounded-full hover:bg-sage transition-all duration-300"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2" data-testid={`quantity-controls-${item.id}`}>
                          <button
                            onClick={() => handleDecrement(item.id)}
                            data-testid={`decrease-${item.id}`}
                            className="w-8 h-8 bg-beige rounded-full flex items-center justify-center text-coffee hover:bg-beige-dark transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-charcoal">{quantity}</span>
                          <button
                            onClick={() => handleIncrement(item)}
                            data-testid={`increase-${item.id}`}
                            className="w-8 h-8 bg-coffee rounded-full flex items-center justify-center text-cream hover:bg-sage transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Place Order Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-cream via-cream to-transparent pt-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="bg-coffee text-cream rounded-2xl p-4 shadow-soft-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cream/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
                    <p className="text-xs text-cream/70">Total: ${totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  data-testid="place-order-button"
                  className="bg-cream text-coffee font-semibold px-6 py-3 rounded-full hover:bg-beige transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Placing...
                    </>
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
