import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  UtensilsCrossed, Search, Plus, Minus, ShoppingCart, X, Bell,
  ChevronRight, CheckCircle2, Clock, Loader2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATEGORIES = ['All', 'Breads', 'Pastries', 'Donuts', 'Cakes', 'Beverages'];

export default function TableOrderPage() {
  const { tableId } = useParams();
  const tableNumber = parseInt(tableId);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [callingWaiter, setCallingWaiter] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);

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

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev[item.id];
      if (existing) return { ...prev, [item.id]: { ...existing, qty: existing.qty + 1 } };
      return { ...prev, [item.id]: { id: item.id, name: item.name, price: item.price, image_url: item.image_url, qty: 1 } };
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev[id];
      if (!existing) return prev;
      if (existing.qty <= 1) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: { ...existing, qty: existing.qty - 1 } };
    });
  };

  const clearItem = (id) => {
    setCart(prev => { const { [id]: _, ...rest } = prev; return rest; });
  };

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setPlacing(true);
    try {
      const orderData = {
        items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty })),
        total_price: totalPrice,
        table_number: tableNumber,
      };
      const res = await axios.post(`${API}/orders`, orderData);
      setOrderPlaced(res.data);
      setCart({});
      setShowCart(false);
      toast.success('Order sent to kitchen!');
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleCallWaiter = async () => {
    setCallingWaiter(true);
    try {
      await axios.post(`${API}/waiter-calls`, { table_number: tableNumber, message: 'Assistance needed' });
      setWaiterCalled(true);
      toast.success('Waiter has been notified!');
      setTimeout(() => setWaiterCalled(false), 30000);
    } catch {
      toast.error('Failed to call waiter');
    } finally {
      setCallingWaiter(false);
    }
  };

  const handleNewOrder = () => {
    setOrderPlaced(null);
    setCart({});
  };

  // Order confirmed screen
  if (orderPlaced) {
    return (
      <div data-testid="table-order-confirmed" className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-sage/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-sage-dark" />
          </div>
          <h1 className="font-serif text-3xl text-coffee mb-2">Order Sent!</h1>
          <p className="text-charcoal/50 text-sm mb-6">Your order is being prepared. Sit tight!</p>

          <div className="soft-card p-4 mb-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-coffee/60 font-medium">Table {tableNumber}</span>
              <span className="text-xs bg-amber-50 text-amber-600 font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {orderPlaced.status}
              </span>
            </div>
            {orderPlaced.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-coffee/5 last:border-0">
                <span className="text-charcoal/70">{item.name} <span className="text-charcoal/30">x{item.quantity}</span></span>
                <span className="text-coffee font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between mt-3 pt-2 border-t border-coffee/10">
              <span className="text-charcoal font-semibold">Total</span>
              <span className="text-coffee font-serif text-xl font-medium">${orderPlaced.total_price.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleNewOrder} data-testid="new-order-button"
              className="w-full bg-coffee text-cream font-semibold py-3 rounded-full hover:bg-sage transition-all">
              Order More
            </button>
            <button onClick={handleCallWaiter} disabled={callingWaiter || waiterCalled} data-testid="call-waiter-confirmed"
              className="w-full bg-white border border-coffee/15 text-coffee font-medium py-3 rounded-full hover:bg-beige/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              {waiterCalled ? 'Waiter Notified' : callingWaiter ? 'Calling...' : 'Call Waiter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="table-order-page" className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-coffee/8 px-4 py-3" data-testid="table-order-header">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-coffee" />
            <div>
              <p className="font-serif text-lg font-semibold text-coffee leading-tight">Sunehri Crumbs</p>
              <p className="text-xs text-sage-dark font-medium">Table {tableNumber}</p>
            </div>
          </div>
          <button onClick={handleCallWaiter} disabled={callingWaiter || waiterCalled} data-testid="call-waiter-button"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all ${
              waiterCalled
                ? 'bg-sage/15 border-sage/30 text-sage-dark'
                : 'bg-white border-coffee/15 text-coffee hover:bg-beige/50'
            }`}>
            <Bell className="w-3.5 h-3.5" />
            {waiterCalled ? 'Notified' : 'Call Waiter'}
          </button>
        </div>
      </header>

      {/* Welcome */}
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        <h1 className="font-serif text-2xl text-coffee mb-1">Welcome to Table {tableNumber}</h1>
        <p className="text-charcoal/50 text-sm">Browse our menu and place your order directly.</p>
      </div>

      {/* Categories - horizontal scroll */}
      <div className="px-4 mb-4 max-w-lg mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" data-testid="table-category-filters">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} data-testid={`table-cat-${c.toLowerCase()}`}
              className={`text-xs font-medium px-4 py-2 rounded-full border whitespace-nowrap transition-all shrink-0 ${
                category === c
                  ? 'bg-coffee text-cream border-coffee'
                  : 'bg-white text-charcoal/50 border-coffee/10 hover:border-coffee/30'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-5 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/25" />
          <input type="text" placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} data-testid="table-search-input"
            className="w-full bg-white border border-coffee/10 text-charcoal text-sm pl-10 pr-4 py-2.5 rounded-full focus:border-coffee/30 focus:outline-none transition-all placeholder:text-charcoal/25" />
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-coffee animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16"><p className="text-charcoal/40">No items found</p></div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const inCart = cart[item.id];
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-coffee/8 p-3 flex gap-3 shadow-soft" data-testid={`table-item-${item.id}`}>
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200'} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-base text-charcoal leading-tight">{item.name}</h3>
                        {item.is_signature && <span className="text-[9px] bg-coffee/10 text-coffee px-1.5 py-0.5 rounded-full font-semibold shrink-0 mt-0.5">BEST</span>}
                      </div>
                      <p className="text-charcoal/40 text-xs leading-relaxed line-clamp-1 mt-0.5">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-coffee font-semibold">${item.price.toFixed(2)}</span>
                      {inCart ? (
                        <div className="flex items-center gap-1" data-testid={`table-qty-${item.id}`}>
                          <button onClick={() => removeFromCart(item.id)} data-testid={`table-minus-${item.id}`}
                            className="w-7 h-7 bg-beige rounded-full flex items-center justify-center text-coffee hover:bg-beige-dark transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold text-charcoal">{inCart.qty}</span>
                          <button onClick={() => addToCart(item)} data-testid={`table-plus-${item.id}`}
                            className="w-7 h-7 bg-coffee rounded-full flex items-center justify-center text-cream hover:bg-sage transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)} data-testid={`table-add-${item.id}`}
                          className="flex items-center gap-1 bg-coffee text-cream text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-sage transition-all">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Sheet */}
      {showCart && (
        <>
          <div className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl border-t border-coffee/10 max-h-[80vh] overflow-hidden flex flex-col" data-testid="cart-sheet">
            <div className="px-5 py-4 border-b border-coffee/8 flex items-center justify-between shrink-0">
              <h2 className="font-serif text-xl text-coffee">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-charcoal/30 hover:text-charcoal hover:bg-beige/50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3" data-testid={`cart-sheet-item-${item.id}`}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-charcoal text-sm font-medium truncate">{item.name}</p>
                    <p className="text-coffee text-xs">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 bg-beige rounded-full flex items-center justify-center text-coffee"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="w-7 h-7 bg-coffee rounded-full flex items-center justify-center text-cream"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => clearItem(item.id)} className="text-charcoal/20 hover:text-red-400 transition-colors ml-1"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-coffee/8 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-charcoal/60">Total</span>
                <span className="text-coffee font-serif text-2xl font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <button onClick={handlePlaceOrder} disabled={placing} data-testid="submit-order-button"
                className="w-full bg-coffee text-cream font-semibold py-3.5 rounded-full hover:bg-sage transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send to Kitchen <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating Cart Bar */}
      {totalItems > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4" data-testid="floating-cart-bar">
          <button onClick={() => setShowCart(true)} data-testid="open-cart-button"
            className="w-full max-w-lg mx-auto bg-coffee text-cream rounded-2xl py-3.5 px-5 flex items-center justify-between shadow-soft-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cream/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="font-semibold">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-medium">${totalPrice.toFixed(2)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Hide scrollbar utility */}
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
