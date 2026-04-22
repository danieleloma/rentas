# RENTAS — PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Nigeria-Focused | ShadCN 2026 UI | Supabase Backend

---

## 1. PRODUCT OVERVIEW

**Rentas** is a mobile-first web platform that helps Nigerians discover, evaluate, and move into properties seamlessly.

It combines:
- Property marketplace
- Trust & verification system
- Real-time communication
- Moving services marketplace

---

## 2. TARGET MARKET

### Primary Users
- Renters (20–45)
- First-time home seekers
- Urban professionals
- Students

### Market Context (Nigeria)
- Mobile-first (low-end Android support required)
- Unstable internet conditions
- High fraud in property listings
- Heavy reliance on calls and WhatsApp
- Informal addressing system

---

## 3. COMPETITIVE POSITIONING

### Competitor
- Nigeria Property Centre

### Differentiation
- Simpler UX (3-tap interaction goal)
- Strong trust layer (verification + reviews)
- Real-time communication (chat + call)
- End-to-end flow (search → move)

---

## 4. CORE FEATURES

### 4.1 Property Discovery
- Location-based search (areas + landmarks)
- Filters: price, type, bedrooms
- Map-based browsing

---

### 4.2 Listings
- Media (images, videos, virtual tours)
- Verified badges
- Property details

---

### 4.3 Location Intelligence
- Nearby:
  - Markets
  - Schools
  - Hospitals
  - Transport access
  - Gym
  - Church

---

### 4.4 Communication
- In-app chat
- One-tap call
- WhatsApp fallback

---

### 4.5 Visit Scheduling
- Calendar booking
- Landlord availability
- Reminders

---

### 4.6 Reviews & Ratings
- Star ratings
- Comments
- Tags:
  - Security
  - Water
  - Power
  - Noise
  - Flood risk

---

### 4.7 Reporting System
- Flag suspicious listings
- Moderation workflow

---

### 4.8 Moving Services
- Search movers
- Compare pricing
- Book movers
- Track jobs

---

## 5. UX PRINCIPLES

- Mobile-first design
- Fast load (low bandwidth optimized)
- 3-tap interaction goal
- Sticky CTA (Call, Chat, Schedule)
- Minimal cognitive load

---

## 6. UI SYSTEM (SHADCN 2026)

### Design System
- Component library: ShadCN UI (2026)
- Styling: TailwindCSS
- Theming: CSS variables + dark mode

### Core Components
- Cards (listings)
- Modal (contact, booking)
- Drawer (mobile interactions)
- Tabs (property info)
- Toasts (notifications)

### Interaction Patterns
- Bottom sheets (mobile)
- Sticky action bar
- Skeleton loaders

---

## 7. TECHNICAL ARCHITECTURE (SUPABASE-BASED)

### 7.1 Frontend
- Next.js (App Router)
- React Query (server state)
- Zustand (client state)

---

### 7.2 Backend (Supabase)

#### Services Used
- PostgreSQL (database)
- Supabase Auth
- Realtime (WebSockets)
- Storage (media)
- Edge Functions (business logic)

---

### 7.3 Database Schema (Core Tables)

#### users
- id
- email
- role
- created_at

#### listings
- id
- title
- description
- price
- location (lat, lng)
- address
- user_id
- verification_status

#### reviews
- id
- listing_id
- user_id
- rating
- comment
- tags

#### messages
- id
- sender_id
- receiver_id
- content

#### bookings
- id
- listing_id
- user_id
- date
- status

#### movers
- id
- name
- rating
- price_range

#### moving_bookings
- id
- mover_id
- user_id
- status

#### reports
- id
- listing_id
- user_id
- reason

---

### 7.4 Realtime System
- Supabase Realtime for chat
- Presence tracking (online status)

---

### 7.5 Media Handling
- Supabase Storage
- Image compression before upload

---

### 7.6 Search Strategy
- Postgres full-text search (MVP)
- Upgrade to external search (future)

---

### 7.7 Payments
- Integration: Paystack / Flutterwave

---

## 8. PERFORMANCE REQUIREMENTS

- Load time < 2.5s (3G)
- Image size < 300KB
- API latency < 500ms

---

## 9. SECURITY

- Supabase Auth (JWT)
- Row Level Security (RLS)
- HTTPS

---

## 10. FRAUD & TRUST SYSTEM

### Verification Levels
- Unverified
- Phone Verified
- Fully Verified

### Detection Signals
- Multiple reports
- Duplicate images
- Suspicious pricing

---

## 11. MVP SCOPE

### Include
- Listings
- Search
- Chat + Call
- Reviews
- Reports
- Basic movers

### Exclude (Phase 2)
- AR tours
- AI recommendations

---

## 12. SUCCESS METRICS

- Contact rate
- Conversion rate
- Listings reported
- Verified listings
- Mover bookings

---

## 13. FUTURE EXTENSIONS

- AI recommendations
- Advanced fraud detection
- Dynamic pricing for movers
- AR virtual tours

---

## 14. SUMMARY

Rentas wins by:
- Simplicity
- Trust
- End-to-end experience

