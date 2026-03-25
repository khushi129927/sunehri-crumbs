import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Grid3X3, CalendarDays,
  Star, MessageSquare, LogOut, Trash2, Check, Edit2, Upload,
  X, Download, Image as ImageIcon, Menu, ChevronLeft
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-coffee/8 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-soft" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-beige rounded-xl flex items-center justify-center text-coffee shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-charcoal/40 text-[10px] sm:text-xs uppercase tracking-wider font-medium truncate">{label}</p>
        <p className="text-coffee font-serif text-xl sm:text-2xl">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: '', category: 'Breads', price: '', description: '', image_url: '', is_signature: false });
  const [editingMenu, setEditingMenu] = useState(null);
  const [tableCount, setTableCount] = useState(10);

  const headers = { Authorization: `Bearer ${token}` };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') { const r = await axios.get(`${API}/dashboard/stats`, { headers }); setStats(r.data); }
      else if (activeTab === 'menu') { const r = await axios.get(`${API}/menu`); setMenuItems(r.data); }
      else if (activeTab === 'orders') { const r = await axios.get(`${API}/orders`, { headers }); setOrders(r.data); }
      else if (activeTab === 'tables') { const r = await axios.get(`${API}/tables`, { headers }); setTables(r.data); }
      else if (activeTab === 'bookings') { const r = await axios.get(`${API}/bookings`, { headers }); setBookings(r.data); }
      else if (activeTab === 'reviews') { const r = await axios.get(`${API}/reviews/all`, { headers }); setReviews(r.data); }
      else if (activeTab === 'contacts') { const r = await axios.get(`${API}/contacts`, { headers }); setContacts(r.data); }
      else if (activeTab === 'gallery') { const r = await axios.get(`${API}/gallery`); setGallery(r.data); }
    } catch (e) {
      if (e.response?.status === 401) { logout(); navigate('/admin/login'); }
    } finally { setLoading(false); }
  }, [activeTab, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const switchTab = (id) => { setActiveTab(id); setSidebarOpen(false); };
  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...menuForm, price: parseFloat(menuForm.price) };
      if (editingMenu) { await axios.put(`${API}/menu/${editingMenu}`, data, { headers }); toast.success('Updated'); }
      else { await axios.post(`${API}/menu`, data, { headers }); toast.success('Added'); }
      setMenuForm({ name: '', category: 'Breads', price: '', description: '', image_url: '', is_signature: false });
      setEditingMenu(null); loadData();
    } catch { toast.error('Failed'); }
  };

  const handleMenuDelete = async (id) => { try { await axios.delete(`${API}/menu/${id}`, { headers }); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); } };
  const handleMenuEdit = (item) => { setEditingMenu(item.id); setMenuForm({ name: item.name, category: item.category, price: item.price.toString(), description: item.description, image_url: item.image_url, is_signature: item.is_signature }); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await axios.post(`${API}/upload`, formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      setMenuForm(prev => ({ ...prev, image_url: `${process.env.REACT_APP_BACKEND_URL}${res.data.url}` }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
  };

  const handleOrderStatus = async (id, status) => { try { await axios.put(`${API}/orders/${id}/status?status=${status}`, {}, { headers }); toast.success(`Status: ${status}`); loadData(); } catch { toast.error('Failed'); } };
  const handleSetupTables = async () => { try { await axios.post(`${API}/tables/setup`, { count: tableCount }, { headers }); toast.success(`${tableCount} tables created`); loadData(); } catch { toast.error('Failed'); } };
  const handleApproveReview = async (id) => { try { await axios.put(`${API}/reviews/${id}/approve`, {}, { headers }); toast.success('Approved'); loadData(); } catch { toast.error('Failed'); } };
  const handleDeleteReview = async (id) => { try { await axios.delete(`${API}/reviews/${id}`, { headers }); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); } };
  const handleDeleteBooking = async (id) => { try { await axios.delete(`${API}/bookings/${id}`, { headers }); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); } };
  const handleDeleteContact = async (id) => { try { await axios.delete(`${API}/contacts/${id}`, { headers }); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); } };
  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    try { await axios.post(`${API}/gallery`, formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }); toast.success('Added'); loadData(); } catch { toast.error('Failed'); }
  };
  const handleDeleteGallery = async (id) => { try { await axios.delete(`${API}/gallery/${id}`, { headers }); toast.success('Removed'); loadData(); } catch { toast.error('Failed'); } };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'tables', label: 'Tables & QR', icon: Grid3X3 },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'contacts', label: 'Messages', icon: MessageSquare },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || 'Dashboard';

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-cream">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-coffee/8 px-4 py-3 flex items-center justify-between" data-testid="admin-mobile-header">
        <button onClick={() => setSidebarOpen(true)} data-testid="admin-menu-toggle" className="w-10 h-10 flex items-center justify-center rounded-xl text-coffee hover:bg-beige/50 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-coffee" />
          <span className="font-serif text-base font-semibold text-coffee">{activeTabLabel}</span>
        </div>
        <button onClick={handleLogout} data-testid="admin-logout-button-mobile" className="w-10 h-10 flex items-center justify-center rounded-xl text-charcoal/30 hover:text-red-500 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} data-testid="sidebar-overlay" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-coffee/8 p-4 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-56 lg:shrink-0 lg:min-h-screen lg:sticky lg:top-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="admin-sidebar"
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="w-5 h-5 text-coffee" />
            <span className="font-serif text-lg font-semibold text-coffee">Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-charcoal/40 hover:text-charcoal transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => switchTab(t.id)} data-testid={`admin-tab-${t.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
                activeTab === t.id ? 'bg-beige text-coffee font-medium' : 'text-charcoal/40 hover:text-charcoal hover:bg-beige/40'
              }`}>
              <t.icon className="w-4 h-4" strokeWidth={1.5} /> {t.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} data-testid="admin-logout-button" className="hidden lg:flex items-center gap-3 px-3 py-2.5 text-sm text-charcoal/30 hover:text-red-500 transition-colors mt-4 rounded-xl">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-0 pt-16 lg:pt-0 flex-1 p-4 sm:p-6 overflow-auto min-h-screen">
        {loading && <div className="text-charcoal/30 text-sm mb-4">Loading...</div>}

        {/* Dashboard */}
        {activeTab === 'dashboard' && stats && (
          <div data-testid="admin-overview">
            <h2 className="font-serif text-xl sm:text-2xl text-coffee mb-4 sm:mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <StatCard label="Total Orders" value={stats.total_orders} icon={ShoppingCart} />
              <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} icon={LayoutDashboard} />
              <StatCard label="Bookings" value={stats.total_bookings} icon={CalendarDays} />
              <StatCard label="Menu Items" value={stats.total_menu} icon={UtensilsCrossed} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Tables" value={stats.total_tables} icon={Grid3X3} />
              <StatCard label="Pending" value={stats.pending_orders} icon={ShoppingCart} />
              <StatCard label="Reviews" value={stats.total_reviews} icon={Star} />
              <StatCard label="Messages" value={stats.total_contacts} icon={MessageSquare} />
            </div>
          </div>
        )}

        {/* Menu Management */}
        {activeTab === 'menu' && (
          <div data-testid="admin-menu-management">
            <h2 className="font-serif text-xl sm:text-2xl text-coffee mb-4 sm:mb-6">Menu Management</h2>
            <form onSubmit={handleMenuSubmit} className="bg-white rounded-2xl border border-coffee/8 p-4 mb-6 space-y-3 shadow-soft" data-testid="menu-item-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Item name" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} data-testid="menu-form-name"
                  className="bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none placeholder:text-charcoal/25" />
                <select value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} data-testid="menu-form-category"
                  className="bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none">
                  {['Breads','Pastries','Donuts','Cakes','Beverages'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="number" step="0.01" placeholder="Price" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} data-testid="menu-form-price"
                  className="bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none placeholder:text-charcoal/25" />
                <input type="text" placeholder="Description" value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} data-testid="menu-form-description"
                  className="bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none placeholder:text-charcoal/25" />
              </div>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Image URL or upload" value={menuForm.image_url} onChange={e => setMenuForm({...menuForm, image_url: e.target.value})} data-testid="menu-form-image-url"
                  className="flex-1 bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none placeholder:text-charcoal/25" />
                <label className="cursor-pointer border border-coffee/10 rounded-xl px-3 py-2.5 text-coffee hover:bg-beige transition-colors shrink-0" data-testid="menu-form-upload">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-charcoal/50 text-sm cursor-pointer">
                  <input type="checkbox" checked={menuForm.is_signature} onChange={e => setMenuForm({...menuForm, is_signature: e.target.checked})} data-testid="menu-form-signature"
                    className="accent-coffee rounded" /> Signature
                </label>
                <div className="flex gap-2 ml-auto">
                  <button type="submit" data-testid="menu-form-submit" className="bg-coffee text-cream font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-sage transition-all">
                    {editingMenu ? 'Update' : 'Add Item'}
                  </button>
                  {editingMenu && (
                    <button type="button" onClick={() => { setEditingMenu(null); setMenuForm({ name: '', category: 'Breads', price: '', description: '', image_url: '', is_signature: false }); }}
                      className="border border-coffee/15 text-charcoal/50 text-sm px-4 py-2.5 rounded-full hover:text-charcoal transition-colors">Cancel</button>
                  )}
                </div>
              </div>
            </form>
            <div className="space-y-2">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-coffee/8 p-3 flex items-center gap-3 shadow-soft" data-testid={`admin-menu-item-${item.id}`}>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 overflow-hidden rounded-xl bg-beige/50">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-charcoal text-sm font-medium truncate">{item.name}</span>
                      {item.is_signature && <span className="text-[10px] bg-sage/20 text-sage-dark px-1.5 py-0.5 rounded-full font-medium shrink-0">SIG</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal/40 text-xs">{item.category}</span>
                      <span className="text-coffee font-semibold text-xs sm:text-sm">${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleMenuEdit(item)} data-testid={`edit-menu-${item.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-charcoal/30 hover:text-coffee hover:bg-beige/50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleMenuDelete(item.id)} data-testid={`delete-menu-${item.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-charcoal/30 hover:text-red-400 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div data-testid="admin-orders-management">
            <h2 className="font-serif text-xl sm:text-2xl text-coffee mb-4 sm:mb-6">Orders</h2>
            {orders.length === 0 ? <p className="text-charcoal/40 text-sm">No orders yet</p> : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-coffee/8 p-4 shadow-soft" data-testid={`admin-order-${order.id}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {order.table_number && <span className="bg-sage/15 text-sage-dark text-xs font-medium px-3 py-1 rounded-full">Table {order.table_number}</span>}
                          <span className={`text-xs uppercase tracking-wider font-medium px-3 py-1 rounded-full ${
                            order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                            order.status === 'preparing' ? 'bg-blue-50 text-blue-600' :
                            'bg-green-50 text-green-600'
                          }`}>{order.status}</span>
                        </div>
                        <p className="text-charcoal/30 text-xs">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <span className="text-coffee font-serif text-xl">${order.total_price.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-charcoal/50 mb-3">
                      {order.items.map((item, i) => <span key={i}>{item.name} x{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>)}
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button onClick={() => handleOrderStatus(order.id, 'preparing')} data-testid={`order-preparing-${order.id}`}
                          className="text-xs bg-blue-50 text-blue-600 font-medium px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors">Start Preparing</button>
                      )}
                      {order.status === 'preparing' && (
                        <button onClick={() => handleOrderStatus(order.id, 'served')} data-testid={`order-served-${order.id}`}
                          className="text-xs bg-green-50 text-green-600 font-medium px-4 py-1.5 rounded-full hover:bg-green-100 transition-colors">Mark Served</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tables */}
        {activeTab === 'tables' && (
          <div data-testid="admin-tables-management">
            <h2 className="font-serif text-xl sm:text-2xl text-coffee mb-4 sm:mb-6">Table & QR Management</h2>
            <div className="bg-white rounded-2xl border border-coffee/8 p-4 mb-6 flex flex-wrap items-center gap-3 shadow-soft" data-testid="table-setup-form">
              <label className="text-charcoal/60 text-sm">Tables:</label>
              <input type="number" min="1" max="100" value={tableCount} onChange={e => setTableCount(parseInt(e.target.value) || 1)} data-testid="table-count-input"
                className="w-20 bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2 text-center rounded-xl focus:border-coffee/30 focus:outline-none" />
              <button onClick={handleSetupTables} data-testid="generate-tables-button"
                className="bg-coffee text-cream font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-sage transition-all">Generate</button>
            </div>
            {tables.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {tables.map(table => (
                  <div key={table.id} className="bg-white rounded-2xl border border-coffee/8 p-3 sm:p-4 text-center shadow-soft" data-testid={`table-qr-${table.table_number}`}>
                    <p className="text-coffee font-serif text-base sm:text-lg mb-2 sm:mb-3">Table {table.table_number}</p>
                    <div className="bg-cream rounded-xl p-1.5 sm:p-2 mb-2 sm:mb-3 inline-block">
                      <img src={`data:image/png;base64,${table.qr_code_base64}`} alt={`QR Table ${table.table_number}`} className="w-24 h-24 sm:w-32 sm:h-32" />
                    </div>
                    <p className="text-charcoal/25 text-[10px] sm:text-xs break-all mb-2 hidden sm:block">{table.qr_code_url}</p>
                    <a href={`data:image/png;base64,${table.qr_code_base64}`} download={`table-${table.table_number}-qr.png`} data-testid={`download-qr-${table.table_number}`}
                      className="inline-flex items-center gap-1 text-coffee text-xs font-medium hover:text-sage-dark transition-colors">
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div data-testid="admin-bookings-management">
            <h2 className="font-serif text-xl sm:text-2xl text-coffee mb-4 sm:mb-6">Bookings</h2>
            {bookings.length === 0 ? <p className="text-charcoal/40 text-sm">No bookings yet</p> : (
              <div className="space-y-2">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-coffee/8 p-4 flex items-start justify-between gap-3 shadow-soft" data-testid={`admin-booking-${b.id}`}>
                    <div className="min-w-0">
                      <p className="text-charcoal text-sm font-medium">{b.name}</p>
                      <p className="text-charcoal/40 text-xs mt-0.5">{b.phone}</p>
                      <p className="text-charcoal/40 text-xs">{b.date} at {b.time} &middot; {b.guests} guests</p>
                    </div>
                    <button onClick={() => handleDeleteBooking(b.id)} data-testid={`delete-booking-${b.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-charcoal/20 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div data-testid="admin-reviews-management">
            <h2 className="font-serif text-xl sm:text-2xl text-coffee mb-4 sm:mb-6">Reviews</h2>
            {reviews.length === 0 ? <p className="text-charcoal/40 text-sm">No reviews yet</p> : (
              <div className="space-y-2">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-coffee/8 p-4 shadow-soft" data-testid={`admin-review-${r.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-charcoal text-sm font-medium">{r.name}</span>
                          <div className="flex gap-0.5">{[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-coffee text-coffee" />)}</div>
                          {r.approved
                            ? <span className="text-[10px] sm:text-xs bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">Approved</span>
                            : <span className="text-[10px] sm:text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">Pending</span>
                          }
                        </div>
                        <p className="text-charcoal/50 text-sm">{r.comment}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!r.approved && <button onClick={() => handleApproveReview(r.id)} data-testid={`approve-review-${r.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 transition-colors"><Check className="w-4 h-4" /></button>}
                        <button onClick={() => handleDeleteReview(r.id)} data-testid={`delete-review-${r.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-charcoal/20 hover:text-red-400 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contacts */}
        {activeTab === 'contacts' && (
          <div data-testid="admin-contacts-management">
            <h2 className="font-serif text-xl sm:text-2xl text-coffee mb-4 sm:mb-6">Contact Messages</h2>
            {contacts.length === 0 ? <p className="text-charcoal/40 text-sm">No messages yet</p> : (
              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-coffee/8 p-4 shadow-soft" data-testid={`admin-contact-${c.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-charcoal text-sm font-medium">{c.name}</span>
                          <span className="text-charcoal/25 text-xs truncate">{c.email}</span>
                        </div>
                        <p className="text-charcoal/50 text-sm">{c.message}</p>
                        <p className="text-charcoal/20 text-xs mt-1">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDeleteContact(c.id)} data-testid={`delete-contact-${c.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-charcoal/20 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery */}
        {activeTab === 'gallery' && (
          <div data-testid="admin-gallery-management">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="font-serif text-xl sm:text-2xl text-coffee">Gallery</h2>
              <label className="cursor-pointer bg-coffee text-cream font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-sage transition-all flex items-center gap-2 shrink-0" data-testid="gallery-upload-button">
                <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Upload</span> Image
                <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {gallery.map(img => (
                <div key={img.id} className="relative group" data-testid={`admin-gallery-${img.id}`}>
                  <div className="aspect-square overflow-hidden rounded-2xl border border-coffee/8 shadow-soft">
                    <img src={img.url?.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${img.url}` : img.url} alt="gallery" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => handleDeleteGallery(img.id)} data-testid={`delete-gallery-${img.id}`}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
