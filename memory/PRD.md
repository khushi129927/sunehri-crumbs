# Sunehri Crumbs - Premium Bakery Website PRD

## Brand
- **Name**: Sunehri Crumbs
- **Tagline**: "Crafted with Care, Baked to Perfection"

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Framer Motion + Shadcn UI components
- **Backend**: FastAPI (Python) with Motor (async MongoDB)
- **Database**: MongoDB
- **Storage**: Emergent Object Storage (for image uploads)
- **Auth**: JWT-based admin authentication

## Design System (Minimal Luxury)
- Background: Soft Cream (#F8F5F0)
- Primary: Warm Beige (#E8DED1)
- Accent: Coffee Brown (#6B4F3A)
- Text: Deep Charcoal (#2B2B2B)
- Secondary: Muted Sage Green (#A3B18A)
- Fonts: Cormorant Garamond (headings), DM Sans (body)

## Implemented Features (March 2026)

### Public Pages
- [x] Homepage (hero, features, signature products, about, testimonials, footer)
- [x] Menu page (dynamic from DB, category filter, search, add to cart)
- [x] QR Table Ordering System (via URL param /menu?table=N)
- [x] Cart page (quantity control, place order with table number)
- [x] Booking page (reservation form)
- [x] Gallery page (dynamic images)
- [x] Reviews page (submit + view approved reviews)
- [x] Contact page (contact form)

### Admin Dashboard
- [x] JWT login (admin@bakery.com / admin123)
- [x] Dashboard overview (stats cards)
- [x] Menu management (CRUD + image upload)
- [x] Order management (view, update status: pending → preparing → served)
- [x] Table & QR management (auto-generate tables + QR codes, downloadable)
- [x] Booking management (view/delete)
- [x] Review management (approve/delete)
- [x] Contact message management (view/delete)
- [x] Gallery management (upload/delete images)

### Backend APIs
- [x] Auth: POST /api/auth/login, GET /api/auth/me
- [x] Menu: GET/POST /api/menu, PUT/DELETE /api/menu/:id
- [x] Orders: POST /api/orders, GET /api/orders, PUT /api/orders/:id/status
- [x] Tables: POST /api/tables/setup, GET /api/tables
- [x] Bookings: POST/GET /api/bookings, DELETE /api/bookings/:id
- [x] Reviews: POST/GET /api/reviews, PUT /api/reviews/:id/approve, DELETE
- [x] Contacts: POST/GET /api/contacts, DELETE /api/contacts/:id
- [x] Gallery: POST/GET /api/gallery, DELETE /api/gallery/:id
- [x] Upload: POST /api/upload, GET /api/files/:path
- [x] Dashboard: GET /api/dashboard/stats

### Database Collections
- users, menu, orders, tables, bookings, reviews, contacts, gallery, files

## Seeded Data
- 15 menu items (Breads, Pastries, Donuts, Cakes, Beverages)
- 3 approved reviews
- 6 gallery images
- 1 admin user

## Backlog (P1)
- [ ] Real-time order updates (WebSocket)
- [ ] Email notifications for bookings/orders
- [ ] Payment integration (Stripe)
- [ ] Multi-language support

## Backlog (P2)
- [ ] Customer accounts / order history
- [ ] Loyalty program
- [ ] SEO meta tags per page
- [ ] Analytics dashboard
