import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Grid3X3, CalendarDays,
  Star, MessageSquare, LogOut, Plus, Trash2, Check, Edit2, Upload,
  X, Download, Image as ImageIcon
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-coffee/8 p-5 flex items-center gap-4 shadow-soft" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="w-11 h-11 bg-beige rounded-xl flex items-center justify-center text-coffee shrink-0">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-charcoal/40 text-xs uppercase tracking-wider font-medium">{label}</p>
        <p className="text-coffee font-serif text-2xl">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...menuForm, price: parseFloat(menuForm.price) };
      if (editingMenu) { await axios.put(`${API}/menu/${editingMenu}`, data, { headers }); toast.success('Updated'); }
      else { await axios.post(`${API}/menu`, data, { headers }); toast.success('Added'); }
      setMenuForm({ name: '', category: 'Breads', price: '', description: '', image_url: '', is_signature: false });
      setEditingMenu(null);
      loadData();
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

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-coffee/8 bg-white p-4 flex flex-col min-h-screen sticky top-0" data-testid="admin-sidebar">
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <UtensilsCrossed className="w-5 h-5 text-coffee" />
          <span className="font-serif text-lg font-semibold text-coffee">Admin</span>
        </div>
        <nav className="flex-1 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} data-testid={`admin-tab-${t.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
                activeTab === t.id ? 'bg-beige text-coffee font-medium' : 'text-charcoal/40 hover:text-charcoal hover:bg-beige/40'
              }`}>
              <t.icon className="w-4 h-4" strokeWidth={1.5} /> {t.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} data-testid="admin-logout-button" className="flex items-center gap-3 px-3 py-2.5 text-sm text-charcoal/30 hover:text-red-500 transition-colors mt-4 rounded-xl">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {loading && <div className="text-charcoal/30 text-sm mb-4">Loading...</div>}

        {/* Dashboard */}
        {activeTab === 'dashboard' && stats && (
          <div data-testid="admin-overview">
            <h2 className="font-serif text-2xl text-coffee mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Orders" value={stats.total_orders} icon={ShoppingCart} />
              <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} icon={LayoutDashboard} />
              <StatCard label="Bookings" value={stats.total_bookings} icon={CalendarDays} />
              <StatCard label="Menu Items" value={stats.total_menu} icon={UtensilsCrossed} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Tables" value={stats.total_tables} icon={Grid3X3} />
              <StatCard label="Pending Orders" value={stats.pending_orders} icon={ShoppingCart} />
              <StatCard label="Reviews" value={stats.total_reviews} icon={Star} />
              <StatCard label="Messages" value={stats.total_contacts} icon={MessageSquare} />
            </div>
          </div>
        )}

        {/* Menu Management */}
        {activeTab === 'menu' && (
          <div data-testid="admin-menu-management">
            <h2 className="font-serif text-2xl text-coffee mb-6">Menu Management</h2>
            <form onSubmit={handleMenuSubmit} className="bg-white rounded-2xl border border-coffee/8 p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-soft" data-testid="menu-item-form">
              <input type="text" placeholder="Name" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} data-testid="menu-form-name"
                className="bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none placeholder:text-charcoal/25" />
              <select value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} data-testid="menu-form-category"
                className="bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none">
                {['Breads','Pastries','Donuts','Cakes','Beverages'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Price" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} data-testid="menu-form-price"
                className="bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none placeholder:text-charcoal/25" />
              <input type="text" placeholder="Description" value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} data-testid="menu-form-description"
                className="bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none placeholder:text-charcoal/25" />
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Image URL" value={menuForm.image_url} onChange={e => setMenuForm({...menuForm, image_url: e.target.value})} data-testid="menu-form-image-url"
                  className="flex-1 bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2.5 rounded-xl focus:border-coffee/30 focus:outline-none placeholder:text-charcoal/25" />
                <label className="cursor-pointer border border-coffee/10 rounded-xl px-3 py-2.5 text-coffee hover:bg-beige transition-colors" data-testid="menu-form-upload">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-charcoal/50 text-sm cursor-pointer">
                <input type="checkbox" checked={menuForm.is_signature} onChange={e => setMenuForm({...menuForm, is_signature: e.target.checked})} data-testid="menu-form-signature"
                  className="accent-coffee rounded" /> Signature
              </label>
              <div className="flex gap-2">
                <button type="submit" data-testid="menu-form-submit" className="bg-coffee text-cream font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-sage transition-all">
                  {editingMenu ? 'Update' : 'Add Item'}
                </button>
                {editingMenu && (
                  <button type="button" onClick={() => { setEditingMenu(null); setMenuForm({ name: '', category: 'Breads', price: '', description: '', image_url: '', is_signature: false }); }}
                    className="border border-coffee/15 text-charcoal/50 text-sm px-4 py-2.5 rounded-full hover:text-charcoal transition-colors">Cancel</button>
                )}
              </div>
            </form>
            <div className="space-y-2">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-coffee/8 p-3 flex items-center gap-4 shadow-soft" data-testid={`admin-menu-item-${item.id}`}>
                  <div className="w-14 h-14 shrink-0 overflow-hidden rounded-xl bg-beige/50">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal text-sm font-medium truncate">{item.name}</span>
                      {item.is_signature && <span className="text-[10px] bg-sage/20 text-sage-dark px-2 py-0.5 rounded-full font-medium">SIG</span>}
                    </div>
                    <span className="text-charcoal/40 text-xs">{item.category}</span>
                  </div>
                  <span className="text-coffee font-semibold text-sm">${item.price.toFixed(2)}</span>
                  <button onClick={() => handleMenuEdit(item)} data-testid={`edit-menu-${item.id}`} className="text-charcoal/30 hover:text-coffee transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleMenuDelete(item.id)} data-testid={`delete-menu-${item.id}`} className="text-charcoal/30 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div data-testid="admin-orders-management">
            <h2 className="font-serif text-2xl text-coffee mb-6">Orders</h2>
            {orders.length === 0 ? <p className="text-charcoal/40 text-sm">No orders yet</p> : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-coffee/8 p-4 shadow-soft" data-testid={`admin-order-${order.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
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
            <h2 className="font-serif text-2xl text-coffee mb-6">Table & QR Management</h2>
            <div className="bg-white rounded-2xl border border-coffee/8 p-4 mb-6 flex items-center gap-4 shadow-soft" data-testid="table-setup-form">
              <label className="text-charcoal/60 text-sm">Number of tables:</label>
              <input type="number" min="1" max="100" value={tableCount} onChange={e => setTableCount(parseInt(e.target.value) || 1)} data-testid="table-count-input"
                className="w-20 bg-beige/30 border border-coffee/10 text-charcoal text-sm px-3 py-2 text-center rounded-xl focus:border-coffee/30 focus:outline-none" />
              <button onClick={handleSetupTables} data-testid="generate-tables-button"
                className="bg-coffee text-cream font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-sage transition-all">Generate Tables</button>
            </div>
            {tables.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {tables.map(table => (
                  <div key={table.id} className="bg-white rounded-2xl border border-coffee/8 p-4 text-center shadow-soft" data-testid={`table-qr-${table.table_number}`}>
                    <p className="text-coffee font-serif text-lg mb-3">Table {table.table_number}</p>
                    <div className="bg-cream rounded-xl p-2 mb-3 inline-block">
                      <img src={`data:image/png;base64,${table.qr_code_base64}`} alt={`QR Table ${table.table_number}`} className="w-32 h-32" />
                    </div>
                    <p className="text-charcoal/25 text-xs break-all mb-2">{table.qr_code_url}</p>
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
            <h2 className="font-serif text-2xl text-coffee mb-6">Bookings</h2>
            {bookings.length === 0 ? <p className="text-charcoal/40 text-sm">No bookings yet</p> : (
              <div className="space-y-2">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-coffee/8 p-4 flex items-center justify-between shadow-soft" data-testid={`admin-booking-${b.id}`}>
                    <div>
                      <p className="text-charcoal text-sm font-medium">{b.name}</p>
                      <p className="text-charcoal/40 text-xs">{b.phone} | {b.date} at {b.time} | {b.guests} guests</p>
                    </div>
                    <button onClick={() => handleDeleteBooking(b.id)} data-testid={`delete-booking-${b.id}`} className="text-charcoal/20 hover:text-red-400 transition-colors">
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
            <h2 className="font-serif text-2xl text-coffee mb-6">Reviews</h2>
            {reviews.length === 0 ? <p className="text-charcoal/40 text-sm">No reviews yet</p> : (
              <div className="space-y-2">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-coffee/8 p-4 flex items-start gap-4 shadow-soft" data-testid={`admin-review-${r.id}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-charcoal text-sm font-medium">{r.name}</span>
                        <div className="flex gap-0.5">{[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-coffee text-coffee" />)}</div>
                        {r.approved
                          ? <span className="text-xs bg-green-50 text-green-600 font-medium px-2.5 py-0.5 rounded-full">Approved</span>
                          : <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2.5 py-0.5 rounded-full">Pending</span>
                        }
                      </div>
                      <p className="text-charcoal/50 text-sm">{r.comment}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!r.approved && <button onClick={() => handleApproveReview(r.id)} data-testid={`approve-review-${r.id}`} className="text-green-500 hover:text-green-600 transition-colors"><Check className="w-4 h-4" /></button>}
                      <button onClick={() => handleDeleteReview(r.id)} data-testid={`delete-review-${r.id}`} className="text-charcoal/20 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            <h2 className="font-serif text-2xl text-coffee mb-6">Contact Messages</h2>
            {contacts.length === 0 ? <p className="text-charcoal/40 text-sm">No messages yet</p> : (
              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-coffee/8 p-4 flex items-start justify-between shadow-soft" data-testid={`admin-contact-${c.id}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-charcoal text-sm font-medium">{c.name}</span>
                        <span className="text-charcoal/25 text-xs">{c.email}</span>
                      </div>
                      <p className="text-charcoal/50 text-sm">{c.message}</p>
                      <p className="text-charcoal/20 text-xs mt-1">{new Date(c.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleDeleteContact(c.id)} data-testid={`delete-contact-${c.id}`} className="text-charcoal/20 hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery */}
        {activeTab === 'gallery' && (
          <div data-testid="admin-gallery-management">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-coffee">Gallery</h2>
              <label className="cursor-pointer bg-coffee text-cream font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-sage transition-all flex items-center gap-2" data-testid="gallery-upload-button">
                <Upload className="w-4 h-4" /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
