import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('sunehri-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [tableNumber, setTableNumber] = useState(() => {
    return localStorage.getItem('sunehri-table') || null;
  });

  useEffect(() => {
    localStorage.setItem('sunehri-cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('sunehri-table', tableNumber);
    }
  }, [tableNumber]);

  const addItem = (item) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('sunehri-cart');
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, tableNumber, setTableNumber, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
