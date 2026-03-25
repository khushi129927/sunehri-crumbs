import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartPage() {
  const { items, tableNumber, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const orderData = {
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total_price: totalPrice,
        table_number: tableNumber ? parseInt(tableNumber) : null,
      };
      const res = await axios.post(`${API}/orders`, orderData);
      setOrderPlaced(res.data);
      clearCart();
      toast.success('Order placed successfully!');
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div data-testid="order-confirmation" className="pt-20 min-h-screen bg-cream flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="soft-card p-10 max-w-md w-full text-center shadow-soft-lg">
          <div className="w-16 h-16 mx-auto mb-6 bg-sage/20 rounded-2xl flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-sage-dark" />
          </div>
          <h2 className="font-serif text-3xl text-coffee mb-3">Order Confirmed</h2>
          <p className="text-charcoal/50 text-sm mb-6">Your order has been placed successfully!</p>
          {orderPlaced.table_number && (
            <div className="bg-sage/10 border border-sage/20 p-3 rounded-xl mb-4">
              <p className="text-charcoal text-sm">Table Number: <span className="text-coffee font-bold text-lg">{orderPlaced.table_number}</span></p>
            </div>
          )}
          <div className="bg-beige/50 rounded-xl p-4 mb-6 text-left">
            {orderPlaced.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-charcoal/60">{item.name} x{item.quantity}</span>
                <span className="text-coffee font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-coffee/10 mt-2 pt-2 flex justify-between font-semibold">
              <span className="text-charcoal">Total</span>
              <span className="text-coffee">${orderPlaced.total_price.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-charcoal/40 text-xs mb-4">Status: <span className="text-sage-dark uppercase font-semibold">{orderPlaced.status}</span></p>
          <Link to="/menu" data-testid="continue-browsing" className="inline-flex items-center gap-2 bg-coffee text-cream font-medium px-6 py-2.5 rounded-full hover:bg-sage transition-all duration-300">
            Continue Browsing <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="pt-20 min-h-screen bg-cream">
      <div className="py-16 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sage-dark font-medium mb-3">Your Selection</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-coffee">Your Cart</h1>
        {tableNumber && (
          <div data-testid="cart-table-indicator" className="inline-flex items-center gap-2 bg-sage/20 border border-sage/30 px-4 py-2 rounded-full mt-4">
            <span className="text-charcoal text-sm">Table <span className="text-coffee font-semibold">{tableNumber}</span></span>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-charcoal/15 mx-auto mb-4" />
            <p className="text-charcoal/40 text-lg mb-6">Your cart is empty</p>
            <Link to="/menu" className="inline-flex items-center gap-2 text-coffee text-sm uppercase tracking-[0.15em] font-medium hover:text-sage-dark transition-colors">
              <ArrowLeft className="w-4 h-4" /> Browse Menu
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {items.map(item => (
                <motion.div key={item.id} layout className="soft-card p-4 flex items-center gap-4" data-testid={`cart-item-${item.id}`}>
                  <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl">
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-charcoal text-lg truncate">{item.name}</h3>
                    <p className="text-coffee text-sm font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} data-testid={`decrease-${item.id}`}
                      className="w-8 h-8 border border-coffee/15 rounded-lg flex items-center justify-center text-charcoal/40 hover:text-coffee hover:border-coffee/30 transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-charcoal w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} data-testid={`increase-${item.id}`}
                      className="w-8 h-8 border border-coffee/15 rounded-lg flex items-center justify-center text-charcoal/40 hover:text-coffee hover:border-coffee/30 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-coffee font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.id)} data-testid={`remove-${item.id}`}
                    className="text-charcoal/20 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="soft-card p-6 shadow-soft-lg">
              <div className="flex justify-between items-center mb-6">
                <span className="text-charcoal/60 text-lg">Total</span>
                <span className="text-coffee font-serif text-3xl font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                data-testid="place-order-button"
                className="w-full bg-coffee text-cream font-semibold py-3.5 rounded-full hover:bg-sage transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {placing ? 'Placing Order...' : 'Place Order'} {!placing && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
