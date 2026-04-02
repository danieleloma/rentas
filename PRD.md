# Product Requirements Document (PRD) - Detailed Technical Spec

## 1. Product Overview

**Product Name:** Rentas  
**Type:** Mobile-first Web Application (PWA)  
**Core Functionality:** A rental marketplace connecting buyers/renters with landlords, featuring virtual tours, neighborhood intelligence, in-app communication, visit scheduling, tenant reviews, and integrated moving services.  
**Target Users:** Mobile-savvy renters and buyers seeking housing.  
**Version:** 1.0  
**Status:** Draft  

---

## 2. User Roles & Permissions

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **Renter/Buyer** | Search, view listings, virtual tour, message, schedule visits, book movers, leave reviews, report listings | Standard |
| **Landlord** | Create/edit listings, manage availability, message renters, approve/reject visits, respond to reviews | Creator |
| **Mover** | Create profile, manage services, receive bookings, update availability | Service Provider |
| **Admin** | Full access, user management, listing moderation, report handling, analytics | Admin |

### 2.1 Permission Matrix

| Feature | Renter | Landlord | Mover | Admin |
|---------|--------|----------|-------|-------|
| View Listings | ✓ | ✓ | ✓ | ✓ |
| Create Listing | ✗ | ✓ | ✗ | ✓ |
| Edit Own Listing | ✗ | ✓ | ✗ | ✓ |
| Delete Own Listing | ✗ | ✓ | ✗ | ✓ |
| Message Users | ✓ | ✓ | ✓ | ✓ |
| Schedule Visits | ✓ | ✗ | ✗ | ✓ |
| Approve Visits | ✗ | ✓ | ✗ | ✓ |
| Leave Reviews | ✓ | ✗ | ✗ | ✓ |
| Respond to Reviews | ✗ | ✓ | ✗ | ✓ |
| Report Listings | ✓ | ✓ | ✓ | ✓ |
| Manage Reports | ✗ | ✗ | ✗ | ✓ |
| Book Mover | ✓ | ✗ | ✗ | ✗ |
| Manage Mover Profile | ✗ | ✗ | ✓ | ✓ |
| View Analytics | ✗ | Limited | ✗ | ✓ |

---

## 3. Functional Requirements

### 3.1 Listings & Search

**FR-001:** Users can browse rental listings on the home page with infinite scroll (20 items per page).

**FR-002:** Users can filter listings by:
- Price range (min/max)
- Location (city, neighborhood, zip code)
- Bedrooms (studio, 1, 2, 3, 4+)
- Bathrooms (1, 2, 3+)
- Property type (apartment, house, condo, townhouse)
- Square footage (min/max)
- Amenities (parking, pool, gym, laundry, pet-friendly, furnished)
- Availability date

**FR-003:** Users can search listings using keyword search (title, description, address).

**FR-004:** Users can save/favorite listings to a personal wishlist.

**FR-005:** Users can share listings via generated deep link or social media.

**FR-006:** Landlords can create listings with:
- Title (max 100 chars)
- Description (max 5000 chars)
- Property type
- Address (geocoded to coordinates)
- Bedrooms, bathrooms, square footage
- Monthly rent, deposit amount
- Amenities (multi-select)
- Photo gallery (max 20 images, max 10MB each)
- Virtual tour (required for featured listings)
- Availability date
- Terms (lease duration, pet policy, smoking policy)

**FR-007:** Landlords can edit or deactivate listings at any time.

### 3.2 Virtual Tour

**FR-008:** Listings must support 360° panoramic virtual tours uploaded as equirectangular JPEG images (min 4K resolution recommended).

**FR-009:** Virtual tour viewer must support:
- Mouse/touch drag to pan
- Zoom in/out (pinch or scroll)
- Auto-rotate option
- Fullscreen mode
- Hotspot navigation between rooms
- Device orientation control (mobile)

**FR-010:** VR mode must be available via WebXR API with fallback to cardboard-style viewer.

**FR-011:** Guided tour mode with numbered hotspots that auto-advance through rooms.

**FR-012:** Virtual tour thumbnails must be preloaded for fast initial render.

### 3.3 Location & Neighborhood Features

**FR-013:** Interactive map displaying listing marker using Mapbox/Google Maps.

**FR-014:** POI overlay layer must show:
- **Markets:** Grocery stores, convenience stores within 2km radius
- **Schools:** Primary, secondary, universities within 5km radius
- **Hospitals:** Hospitals, clinics, pharmacies within 5km radius
- **Transit:** Bus stops, metro stations within 1km radius

**FR-015:** Each POI marker must display on tap:
- Name
- Distance from listing (walking/driving)
- Rating (if available)
- Hours of operation
- Direction link to external maps app

**FR-016:** POI data sourced from OpenStreetMap/Google Places API with fallback to cached data.

**FR-017:** "Walk Score" and "Transit Score" calculated and displayed.

### 3.4 In-App Communication

**FR-018:** Real-time messaging using WebSocket (Socket.io) with fallback to long polling.

**FR-019:** Message types supported:
- Text (max 2000 chars)
- Image (max 10MB)
- Document (PDF, max 10MB)
- Voice message (max 60 seconds)

**FR-020:** Messages must be stored encrypted at rest (AES-256).

**FR-021:** VoIP calling using WebRTC with TURN server for NAT traversal.

**FR-022:** Push notifications via FCM for:
- New messages
- Visit request status changes
- Mover booking updates
- New reviews on own listing

**FR-023:** Conversation threads organized by listing.

**FR-024:** Message search within conversation.

### 3.5 Visit Scheduling

**FR-025:** Landlords set weekly availability schedule (time slots, recurring).

**FR-026:** Renters request visit via:
- Select date from calendar
- Select time slot
- Add note (optional)
- Select viewing type (in-person, video call)

**FR-027:** Visit states: Pending → Approved/Rejected → Completed/Cancelled.

**FR-028:** Automated reminders:
- Email 24 hours before
- Push notification 2 hours before

**FR-029:** Visit history logged with actual start/end time.

**FR-030:** Landlord can suggest alternative time if original slot unavailable.

### 3.6 Ratings & Reviews

**FR-031:** Only verified tenants (with recorded move-in date) can leave reviews.

**FR-032:** Review includes:
- Overall rating (1-5 stars, required)
- Category ratings:
  - Neighborhood (1-5)
  - Noise Level (1-5)
  - Maintenance (1-5)
  - Amenities Accuracy (1-5)
- Written comment (max 1000 chars, required)
- Pros (optional, tags)
- Cons (optional, tags)
- Photos (optional, max 5)

**FR-033:** Landlords can respond once to each review (max 500 chars).

**FR-034:** Reviews displayed sorted by most recent first.

**FR-035:** Landlord can request removal of false reviews (admin review).

### 3.7 Report Listings

**FR-036:** Report button accessible from listing detail page.

**FR-037:** Report categories:
- Scam/Fraud
- Listing not available
- Inaccurate information
- Inappropriate content
- Landlord unresponsive (after 7 days no response)
- Other

**FR-038:** Report submission requires:
- Category selection
- Description (max 500 chars, optional)
- Evidence (images, screenshots, optional)

**FR-039:** Reporter receives confirmation with ticket ID.

**FR-040:** Admin dashboard displays all reports with status:
- New
- Under Review
- Action Taken ( landlord notified / listing removed )
- Resolved

**FR-041:** Automatic listing suspension if report involves fraud (admin action required to restore).

### 3.8 Moving Services Integration

**FR-042:** Movers can create profiles with:
- Company name
- Logo
- Description
- Service area (defined by postal codes/zones)
- Fleet size and vehicle types
- Services offered (packing, loading, transport, unpacking)
- Pricing (hourly rate, fixed price for standard move)
- Insurance coverage amount
- Availability calendar
- Photos of team/vehicles

**FR-043:** Renter search movers by:
- Service area
- Move date
- Price range
- Service type
- Rating (minimum)

**FR-044:** Mover booking flow:
1. Select mover from search results
2. Select move date and time window
3. Select services needed
4. Enter pickup and drop-off addresses
5. Get estimated price
6. Confirm booking (requires payment in Phase 2)
7. Receive confirmation

**FR-045:** Booking states: Requested → Confirmed → In Progress → Completed → Reviewed.

**FR-046:** Post-booking, renter can:
- Message mover directly
- View mover contact details
- Cancel with policy (24hr notice for full refund)
- Reschedule

---

## 4. Technical Specification

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (PWA)                        │
│  React + TypeScript / Next.js / Tailwind CSS               │
│  PWA Service Worker / Workbox                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS (TLS 1.3)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (NGINX)                      │
│  Rate Limiting / SSL Termination / Load Balancing          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌───────────┐  ┌───────────────┐  ┌─────────────┐
│  Auth     │  │  Listings     │  │  Messages   │
│  Service  │  │  Service     │  │  Service    │
└─────┬─────┘  └───────┬───────┘  └──────┬──────┘
      │               │                  │
      ▼               ▼                  ▼
┌───────────┐  ┌───────────────┐  ┌─────────────┐
│  Redis    │  │  PostgreSQL   │  │  WebSocket  │
│  (JWT)    │  │  (Primary)    │  │  Server     │
└───────────┘  └───────────────┘  └─────────────┘
```

### 4.2 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend Framework** | React | 18.x |
| **Meta-framework** | Next.js | 14.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **State Management** | Zustand | 4.x |
| **API Client** | TanStack Query | 5.x |
| **Maps** | Mapbox GL JS | 3.x |
| **Virtual Tour** | Pannellum | 2.5.x |
| **Real-time** | Socket.io Client | 4.x |
| **PWA** | Workbox | 7.x |

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend Framework** | Node.js + Express | 20.x |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL | 15.x |
| **ORM** | Prisma | 5.x |
| **Cache** | Redis | 7.x |
| **Real-time** | Socket.io | 4.x |
| **Authentication** | JWT + Passport.js | - |
| **File Storage** | AWS S3 | - |
| **Email** | SendGrid / AWS SES | - |
| **Push Notifications** | Firebase Cloud Messaging | - |
| **Search** | Elasticsearch | 8.x |
| **Video Calling** | WebRTC (simple-peer) | - |

### 4.3 Infrastructure

| Component | Service | Configuration |
|-----------|---------|---------------|
| **Compute** | AWS EC2 / DigitalOcean Droplet | t3.large (2 vCPU, 8GB) |
| **Database** | AWS RDS PostgreSQL | db.t3.medium |
| **Cache** | AWS ElastiCache Redis | cache.t3.micro |
| **CDN** | Cloudflare | Enterprise plan |
| **Storage** | AWS S3 | Standard tier |
| **Maps** | Mapbox | Enterprise plan |
| **Email** | AWS SES | - |
| **SSL** | Let's Encrypt (auto-renew) | - |
| **Monitoring** | Sentry + Datadog | - |
| **CI/CD** | GitHub Actions | - |

### 4.4 Database Schema

#### 4.4.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  role VARCHAR(20) NOT NULL DEFAULT 'renter',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  fcm_token VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### 4.4.2 Listings Table
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  property_type VARCHAR(50) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3, 1),
  square_footage INTEGER,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  deposit DECIMAL(10, 2),
  available_from DATE,
  amenities JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  virtual_tour_url VARCHAR(500),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_landlord ON listings(landlord_id);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_location ON listings(latitude, longitude);
CREATE INDEX idx_listings_price ON listings(monthly_rent);
```

#### 4.4.3 Listing Images Table
```sql
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  position INTEGER DEFAULT 0,
  is_virtual_tour BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.4.4 Messages Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  participant_one_id UUID NOT NULL REFERENCES users(id),
  participant_two_id UUID NOT NULL REFERENCES users(id),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participant_one_id, participant_two_id, listing_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message_type VARCHAR(20) DEFAULT 'text',
  content TEXT NOT NULL,
  media_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

#### 4.4.5 Visits Table
```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  renter_id UUID NOT NULL REFERENCES users(id),
  landlord_id UUID NOT NULL REFERENCES users(id),
  scheduled_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP,
  viewing_type VARCHAR(20) DEFAULT 'in_person',
  status VARCHAR(20) DEFAULT 'pending',
  note TEXT,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visits_listing ON visits(listing_id);
CREATE INDEX idx_visits_renter ON visits(renter_id);
CREATE INDEX idx_visits_status ON visits(status);
```

#### 4.4.6 Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  renter_id UUID NOT NULL REFERENCES users(id),
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  neighborhood_rating INTEGER,
  noise_rating INTEGER,
  maintenance_rating INTEGER,
  amenities_rating INTEGER,
  comment TEXT NOT NULL,
  pros JSONB DEFAULT '[]',
  cons JSONB DEFAULT '[]',
  landlord_response TEXT,
  response_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);
```

#### 4.4.7 Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  reporter_id UUID NOT NULL REFERENCES users(id),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  evidence_urls JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'new',
  admin_notes TEXT,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_listing ON reports(listing_id);
CREATE INDEX idx_reports_status ON reports(status);
```

#### 4.4.8 Movers Table
```sql
CREATE TABLE movers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  company_name VARCHAR(200) NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  service_area JSONB NOT NULL,
  fleet_info JSONB,
  services JSONB NOT NULL,
  hourly_rate DECIMAL(10, 2),
  fixed_price DECIMAL(10, 2),
  insurance_coverage DECIMAL(10, 2),
  availability JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mover_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mover_id UUID NOT NULL REFERENCES movers(id),
  renter_id UUID NOT NULL REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  pickup_address VARCHAR(500) NOT NULL,
  dropoff_address VARCHAR(500) NOT NULL,
  scheduled_date DATE NOT NULL,
  time_window_start TIME NOT NULL,
  time_window_end TIME NOT NULL,
  services JSONB NOT NULL,
  estimated_price DECIMAL(10, 2) NOT NULL,
  final_price DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'requested',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movers_service_area ON movers USING GIN(service_area);
CREATE INDEX idx_mover_bookings_mover ON mover_bookings(mover_id);
CREATE INDEX idx_mover_bookings_status ON mover_bookings(status);
```

### 4.5 API Endpoints

#### 4.5.1 Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| POST | /api/auth/logout | Logout user | JWT |
| POST | /api/auth/refresh | Refresh access token | JWT |
| POST | /api/auth/forgot-password | Request password reset | Public |
| POST | /api/auth/reset-password | Reset password | Public |
| GET | /api/auth/me | Get current user | JWT |

#### 4.5.2 Listings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/listings | List listings (with filters) | Public |
| GET | /api/listings/:id | Get listing details | Public |
| POST | /api/listings | Create listing | Landlord |
| PUT | /api/listings/:id | Update listing | Landlord |
| DELETE | /api/listings/:id | Delete listing | Landlord |
| POST | /api/listings/:id/favorite | Toggle favorite | JWT |
| GET | /api/listings/favorites | Get favorite listings | JWT |

#### 4.5.3 Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/conversations | List conversations | JWT |
| GET | /api/conversations/:id/messages | Get messages | JWT |
| POST | /api/conversations/:id/messages | Send message | JWT |
| POST | /api/calls/initiate | Initiate call | JWT |

#### 4.5.4 Visits
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/visits | List visits | JWT |
| POST | /api/visits | Request visit | JWT |
| PUT | /api/visits/:id | Update visit | JWT |
| PUT | /api/visits/:id/status | Update visit status | Landlord |

#### 4.5.5 Reviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/listings/:id/reviews | Get listing reviews | Public |
| POST | /api/listings/:id/reviews | Create review | JWT |
| PUT | /api/reviews/:id | Update review | JWT |
| POST | /api/reviews/:id/respond | Landlord response | Landlord |

#### 4.5.6 Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/listings/:id/report | Report listing | JWT |
| GET | /api/reports | List reports (admin) | Admin |

#### 4.5.7 Movers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/movers | Search movers | JWT |
| GET | /api/movers/:id | Get mover profile | JWT |
| POST | /api/movers | Create mover profile | Mover |
| PUT | /api/movers/:id | Update mover profile | Mover |
| POST | /api/movers/:id/book | Book mover | JWT |
| GET | /api/bookings | List bookings | JWT |
| PUT | /api/bookings/:id | Update booking | JWT |

### 4.6 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Data in Transit** | TLS 1.3 |
| **Data at Rest** | AES-256 encryption for messages, reviews |
| **Password Storage** | bcrypt with cost factor 12 |
| **Authentication** | JWT with access (15min) + refresh (7 days) tokens |
| **Rate Limiting** | 100 req/min per IP, 1000 req/min authenticated |
| **CORS** | Whitelist only trusted domains |
| **CSRF** | Same-site cookies, CSRF tokens |
| **Input Validation** | Zod schema validation |
| **SQL Injection** | Parameterized queries via Prisma |
| **XSS** | Content Security Policy, sanitized output |
| **File Upload** | Max 10MB, allowed types: jpg, png, pdf |

### 4.7 Third-Party Integrations

| Service | Purpose | API |
|---------|---------|-----|
| **Mapbox** | Maps, geocoding, POI data | Mapbox GL JS, Geocoding API |
| **AWS S3** | File storage (images, documents) | AWS SDK |
| **Firebase** | Push notifications | FCM HTTP API |
| **SendGrid** | Transactional emails | SendGrid API |
| **Twilio** | SMS verification (optional) | Twilio API |
| **Stripe** | Payment processing (Phase 2) | Stripe SDK |

### 4.8 File Structure (Frontend)

```
/src
  /app
    /(auth)
      /login
      /register
    /(dashboard)
      /listings
      /messages
      /visits
      /movers
      /profile
    /api
  /components
    /ui
    /listings
    /map
    /chat
    /virtual-tour
  /hooks
  /lib
    /api
    /utils
  /store
  /types
  /styles
```

### 4.9 File Structure (Backend)

```
/src
  /config
  /controllers
  /middleware
    /auth
    /validation
  /models
    /prisma
  /routes
  /services
  /types
  /utils
```

---

## 5. User Flows

### 5.1 Renter Journey
```
1. Open App → Landing Page
2. Browse listings / Use search/filters
3. View Listing Details
4. [Optional] Launch Virtual Tour
5. [Optional] Check POI Map
6. Click "Contact Landlord"
7. Send Message / Schedule Visit
8. Visit Approved → Physical/Video Visit
9. Decide to Lease
10. [Optional] Book Mover
11. Move In
12. Leave Review (verified)
```

### 5.2 Landlord Journey
```
1. Register → Select "Landlord" role
2. Create First Listing
3. Upload Photos + Virtual Tour
4. Set Availability Calendar
5. Receive Message Notification
6. Respond to Inquiries
7. Approve/Reject Visit Requests
8. Conduct Visit
9. Lease Agreed (off-platform)
10. Receive Review
11. [Optional] Respond to Review
12. Handle Report (if any)
```

### 5.3 Mover Journey
```
1. Register → Select "Mover" role
2. Create Mover Profile
3. Set Service Area, Pricing, Availability
4. Receive Booking Request
5. Accept/Decline Booking
6. Complete Move
7. Request Review
```

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Page Load Time** | < 3 seconds on 3G |
| **Time to Interactive** | < 5 seconds |
| **API Response Time** | < 200ms (p95) |
| **WebSocket Latency** | < 100ms |
| **Virtual Tour Load** | < 4 seconds (4G) |
| **Uptime SLA** | 99.5% |
| **Concurrent Users** | 10,000 |
| **Push Notification Delivery** | < 5 seconds |
| **Search Response** | < 500ms |

### 6.1 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

### 6.2 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratio ≥ 4.5:1

---

## 7. Out of Scope (Phase 1)

- Rent payment processing
- Lease agreement generation/e-signing
- Tenant background checks
- Insurance products
- Furniture rental
- Real-time video tours (livestream)
- AI-powered listing recommendations
- Multi-language support
- Landlord verification/badges
- Maintenance request ticketing

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|--------------|
| Monthly Active Users | 50,000 | Analytics |
| Total Listings | 10,000 | Database |
| Virtual Tour Adoption | 40% of listings | Event tracking |
| Message Delivery Rate | 99% | Message logs |
| Visit Scheduling Rate | 25% of inquiries | Event tracking |
| Mover Booking Rate | 10% of lease signups | Booking data |
| Report Resolution Time | < 48 hours | Ticket system |
| User Satisfaction (NPS) | > 50 | In-app survey |
| App Store Rating | > 4.5 | App stores |

---

## 9. Phased Rollout Plan

### Phase 1 - MVP (Weeks 1-8)
**Goal:** Core rental discovery and communication

| Feature | Deliverable |
|---------|-------------|
| User Auth | Sign up, login, profile |
| Listings | CRUD, search, filters, favorites |
| Virtual Tour | 360° viewer, room navigation |
| Messaging | Real-time chat |
| Visit Scheduling | Calendar, request/approve flow |

### Phase 2 - Growth (Weeks 9-14)
**Goal:** Trust signals and safety

| Feature | Deliverable |
|---------|-------------|
| POI/Map | Market, schools, hospitals overlay |
| Reviews | Tenant ratings, verified badges |
| Reports | Report flow, admin dashboard |
| Push Notifications | FCM integration |

### Phase 3 - Expansion (Weeks 15-20)
**Goal:** Moving services and advanced communication

| Feature | Deliverable |
|---------|-------------|
| Moving Services | Mover profiles, search, booking |
| VoIP Calling | WebRTC in-app calls |
| Payment | Stripe integration for movers |

---

## 10. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low virtual tour adoption | Medium | Make tours mandatory for featured listings |
| Spam/fake listings | High | Manual moderation queue, landlord verification |
| VoIP call quality | Medium | Fallback to phone call option |
| Map API costs | Medium | Cache POI data, use OpenStreetMap fallback |
| User data breach | Critical | Encryption at rest, penetration testing |
