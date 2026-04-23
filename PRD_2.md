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

## 13. DASHBOARD — REQUIREMENTS & FEATURES

### 13.0 Strategic Intent

The dashboard is the **operational core** of Rentas. It is where users return daily — not just to discover properties, but to manage their housing journey. For renters it replaces the WhatsApp thread and note-keeping. For landlords it replaces the missed-call log and scattered notebook. Every screen must deliver a clear next action within two taps on a 5-inch screen over a slow 3G connection.

---

### 13.1 Design Principles

| Principle | Application |
|-----------|-------------|
| **Role-first navigation** | Sidebar and bottom nav adapt to renter, landlord, mover, and admin roles. No role sees irrelevant items. |
| **Action density** | Every dashboard card surfaces one primary action. No dead-end screens. |
| **Offline grace** | Stale data shown with a subtle "last updated" timestamp rather than a blank state. |
| **Nigeria-aware** | Currency in ₦, dates in DD/MM/YYYY, addresses informal-first (area → landmark → street). |
| **Mobile-first** | Bottom nav is the primary nav on screens < 768px. Sidebar collapses to offcanvas. |

---

### 13.2 Navigation Shell

#### 13.2.1 Sidebar (≥ 768px)

The `AppSidebar` renders role-gated navigation:

**All roles**
- Dashboard (overview)
- Listings (browse)
- Messages
- Visits
- Profile

**Landlord / Admin additions**
- Inquiries (with unresponded count badge)
- My Listings (manage active listings)
- New Listing

**Mover additions** *(Phase 2)*
- My Jobs
- Earnings

**Admin additions** *(Phase 2)*
- Reports
- Users
- Analytics

Secondary nav (bottom of sidebar): Settings, Help & Support.

Footer: `NavUser` — avatar, name, email, logout.

#### 13.2.2 Bottom Nav (< 768px)

Five fixed tabs: Home (listings browse), Messages, Visits, Movers, Profile.
Active tab highlighted. Unread message badge on Messages tab. Pending visit count badge on Visits tab (landlord only).

---

### 13.3 Dashboard Overview (`/dashboard`)

**Purpose:** Personalized at-a-glance view of activity and next steps for each role.

#### 13.3.1 Renter Overview

| Widget | Data | Primary Action |
|--------|------|----------------|
| **Upcoming Visits** | Count (pending + approved) | View /visits |
| **Unread Messages** | Count | Open /messages |
| **Saved Listings** | Count + 3 thumbnail previews | View /listings?saved=1 |
| **Mover Booking** | Active booking status, mover name | Track booking |
| **Quick Actions** | Browse · Visits · Messages · Saved | Direct nav tiles |

**Empty state:** New renter sees guided checklist — "Complete profile → Browse listings → Save a favourite → Schedule a visit."

#### 13.3.2 Landlord Overview — Design Specification

The landlord overview is the most information-dense screen in the product. A landlord managing 3–10 properties needs to triage, act, and move on within 60 seconds of opening the app.

**Layout (desktop ≥ 1024px):**
```
┌──────────────────────────────────────────────────────────────────┐
│  KPI Bar (4 cards, full width)                                   │
│  Active Listings | Inquiries | Pending Visits | Unread Messages  │
├──────────────────────────────────────┬───────────────────────────┤
│  Recent Inquiries (list, 5 items)    │  Visits Needing Action    │
│  — name, listing, message preview    │  — property, date, type   │
│  — time elapsed + urgency dot        │  — Approve / Reject CTAs  │
├──────────────────────────────────────┴───────────────────────────┤
│  Listing Performance Chart (7-day views + inquiry rate, line)    │
├──────────────────────────────────────────────────────────────────┤
│  Recent Reviews (latest 3, with respond CTA if unresponded)      │
└──────────────────────────────────────────────────────────────────┘
```

**Layout (mobile < 768px):**
KPI cards in a 2×2 grid → Recent Inquiries → Pending Visits → Chart (collapsed/hidden by default to save bandwidth) → Reviews.

**KPI Cards — `DashboardCards` (`LandlordDashboard`):**

| Card | Live Data Source | Trend Badge |
|------|-----------------|-------------|
| Active Listings | `listings` where `landlord_id = me AND status = active` | — |
| Inquiries | `getInquiriesApi` count | — |
| Pending Visits | `visits` where `landlord_id = me AND status = pending` | — |
| Unread Messages | `messages` where `is_read = false AND sender_id ≠ me` | — |

All four cards link to their respective routes. Tap = navigate.

**`SectionCards` replacement for Landlord:**
The generic `SectionCards` component (currently showing hardcoded Revenue/Customers/Accounts/Growth) must be replaced with landlord-specific live metrics:

| Metric Card | Data | Footer Context |
|-------------|------|----------------|
| Total Listing Views | 7-day sum across all active listings | "vs last week ↑/↓ X%" |
| Contact Rate | (inquiries / views) × 100, last 7 days | "Industry avg: 8%" |
| Avg. Response Time | Median hours to first reply | "Target: < 4 hours" |
| Visit Approval Rate | Approved / (Approved + Rejected), last 30 days | "Platform avg: 72%" |

**Recent Inquiries widget:**
- Show latest 5 inquiries from `getInquiriesApi`
- Each row: renter name · listing title (truncated) · message preview (1 line) · time elapsed
- Urgency dot: green (< 4h) · amber (4–24h) · red (> 24h since inquiry)
- CTA per row: "Reply" (mailto / open message thread) · "View all" link to `/inquiries`

**Visits Needing Action widget:**
- Show visits where `status = pending`, ordered by `scheduled_at ASC`
- Each row: listing title · scheduled date/time · In-Person / Video badge
- Inline actions: Approve (primary) · Reject (destructive)
- Action triggers toast + updates visit status optimistically
- "View all visits" link to `/visits`

**Listing Performance Chart:**
- Line chart using existing `ChartAreaInteractive` component
- X-axis: last 7 days
- Y-axis primary: listing views (per day, summed across all active listings)
- Y-axis secondary: inquiries received (per day)
- Data from Supabase `listing_views` and `inquiries` tables with `created_at` filter
- Period toggle: 7D · 30D

**Recent Reviews widget:**
- Show latest 3 reviews across all landlord's listings
- Each: listing name · star rating · comment excerpt (2 lines) · "Verified stay" badge if applicable
- If `landlord_response` is null → show "Respond" button (primary, small)
- Clicking "Respond" opens inline textarea (500 char limit) with Submit / Cancel

**Verification nudge banner (conditional):**
- Shown only if landlord is unverified
- "Verify your phone to get a trust badge on your listings — renters are 3× more likely to contact verified landlords."
- CTA: "Verify now" → `/profile#verification`
- Dismissible per session (localStorage flag)

**Empty state (new landlord, no listings):**
Single centred card: "You don't have any listings yet." + "Create your first listing" primary button + checklist of what to do next (Upload photos · Set availability · Share listing link).

---

### 13.4 Messages (`/messages`, `/messages/[id]`)

**FR-DASH-001:** Conversation list sorted by most recent message. Unread conversations shown in bold with unread count badge.

**FR-DASH-002:** Each conversation item shows:
- Counterpart name + avatar
- Listing thumbnail + title
- Message preview (truncated to 60 chars)
- Relative timestamp (e.g. "2h ago")

**FR-DASH-003:** Conversation detail (`/messages/[id]`):
- Message bubbles grouped by date
- Own messages right-aligned, counterpart left-aligned
- Read receipts (single tick = sent, double tick = read)
- Image and document attachments inline
- "Schedule a Visit" shortcut button pinned above input (links to visit modal for that listing)
- Typing indicator via WebSocket presence

**FR-DASH-004:** Empty state: "No conversations yet. Contact a landlord from any listing to start chatting."

**FR-DASH-005 (Landlord):** Landlord conversation header pins the listing title and thumbnail. Quick-reply template chip row beneath input:
- "Property is still available"
- "I'll confirm your visit shortly"
- "Sorry, this property has been taken"

Tapping a chip populates the input without sending. Landlord can edit before sending.

---

### 13.5 Visits (`/visits`)

**FR-DASH-010:** Visits page is role-aware:
- **Renter:** "My Visits" — visits they have requested
- **Landlord:** "Inspection Requests" — visits requested on their listings, sorted by `scheduled_at ASC`

**FR-DASH-011:** Visit card must show (additions to current `VisitCard` component):
- Property name + address (already shown)
- Scheduled date and time (already shown)
- Visit type badge: In-Person / Video Call (already shown)
- Status badge: Pending · Approved · Rejected · Completed · Cancelled (already shown)
- **Missing — Renter name** for landlord view: First name + last name of requesting renter
- **Missing — Renter phone** for landlord view: shown after approval to enable direct coordination

**FR-DASH-012:** Renter actions per visit (current `VisitCard` only has Cancel):
- Cancel — already implemented
- **Missing — Message landlord:** text link "Message [Landlord Name]" → deep link to `/messages/[conversationId]`
- **Missing — Reschedule:** opens a date/time picker bottom sheet, resets status to `pending`

**FR-DASH-013:** Landlord actions per visit (current `VisitCard` has Approve + Reject):
- Approve — already implemented
- Reject — already implemented
- **Missing — Reject with reason:** clicking Reject opens a compact inline form with a single textarea (optional, max 200 chars) and a confirm button
- **Missing — Suggest alternative time:** link "Suggest different time" opens date/time picker; on confirm sends a system message in the conversation thread with the suggested slot
- **Missing — Mark Completed:** available on `approved` visits past their `scheduled_at` time; transitions status to `completed`

**FR-DASH-014:** Status change triggers in-app toast + push notification to counterpart.

**FR-DASH-015:** Filter bar above visit list (landlord only): All · Pending · Approved · Completed. Default: All. Shows count per filter.

**FR-DASH-016 (Phase 2):** Video call button appears on approved video-call visits starting 15 minutes before `scheduled_at`. Uses WebRTC (simple-peer).

---

### 13.6 Listings Management (`/listings/new` + `/listings/[id]/edit`, landlord-only)

#### 13.6.1 Create New Listing — `/listings/new`

**Current state:** Single-page `ListingForm` with sections rendered in one scroll. All fields are present but there is no progress indicator, no draft save, and no step-by-step guidance.

**Target design — Stepped form with progress indicator:**

```
Step 1 of 4 ── Basics ──────────────────── ● ○ ○ ○
Step 2 of 4 ── Location ────────────────── ● ● ○ ○
Step 3 of 4 ── Photos ──────────────────── ● ● ● ○
Step 4 of 4 ── Details & Terms ─────────── ● ● ● ●
```

| Step | Fields | Validation gate |
|------|--------|-----------------|
| 1 – Basics | Title, property type, bedrooms, bathrooms, monthly rent (₦), deposit (₦), available from | title + rent required |
| 2 – Location | Street address, area/LGA, city, state | address + city required |
| 3 – Photos | Upload (drag-drop + camera), reorder, cover photo selection | ≥ 1 photo required |
| 4 – Details | Description, amenities, lease duration, pet policy, smoking policy, virtual tour URL | none required |

**Navigation:** "Next" advances step (validates current). "Back" returns without clearing. "Save draft" persists to localStorage and Supabase `drafts` table at any step.

**FR-DASH-020:** Draft auto-save every 30 seconds. Draft indicator in page header: "Draft saved 2 min ago". On returning to `/listings/new` with a saved draft, show banner: "You have an unsaved listing draft. Continue?" → Resume / Discard.

**FR-DASH-021:** Photo upload: drag-and-drop + tap-to-open file picker (already implemented). Missing: reorder via drag. First photo is labelled "Cover". Cover photo selection badge must be preserved when reordering.

**FR-DASH-022:** On publish, listing enters `active` status immediately (MVP — no manual moderation). Landlord sees success toast: "Your listing is live!" with "View listing" + "Add another" actions.

**FR-DASH-023:** Nigeria-specific amenities to add to the existing `AMENITY_OPTIONS` list:
- Generator (steady power)
- Borehole / Running water
- Security guard / Estate gating
- BQ (Boys' Quarters)
- POP ceiling
- Tiled floors
- Prepaid meter (electricity)

#### 13.6.2 Manage Listings — `/listings/manage` (new route, landlord-only)

**Purpose:** Central view for a landlord to see, edit, pause, and delete all their listings. Currently missing — landlords have no dedicated listing management screen.

**Layout:** Table on desktop, card list on mobile.

**Columns (desktop table):**

| Column | Content |
|--------|---------|
| Listing | Cover photo thumbnail + title + address |
| Status | Badge: Active · Paused · Deactivated |
| Views | 7-day view count |
| Inquiries | Total received |
| Rent | ₦ monthly |
| Created | Date |
| Actions | Edit · Pause/Activate · Delete |

**Status controls:**
- **Active → Paused:** listing hidden from browse results; direct URL still works. Confirmation: "Renters won't find this listing in search. You can reactivate anytime."
- **Paused → Active:** immediate. No confirmation.
- **Delete:** destructive. Requires confirmation dialog: "Delete [Listing Title]? This cannot be undone. All related inquiries and visit history will be preserved for 90 days." Soft-delete in DB (`status = deleted`).

**Edit (`/listings/[id]/edit`):** Same stepped form as create, pre-populated. Cover photo and existing photos shown first in the photo step. Adding new photos uploads directly; removing existing photos marks them `deleted` in `listing_images`.

---

### 13.7 Inquiries (`/inquiries`, landlord-only)

**Current state:** Basic list with email, phone, and WhatsApp links. No urgency signal, no archive, no group-by-listing, no reply action within the app.

**Target design:**

**FR-DASH-030:** Top of page — filter tabs: All · Unresponded · Archived. Default: All. Counts shown per tab.

**FR-DASH-031:** Inquiry cards — additions to current implementation:

| Field | Current | Required |
|-------|---------|----------|
| Renter name | ✓ | ✓ |
| Listing title | ✓ (if available) | ✓ always |
| Message preview | ✓ | ✓ |
| Date | ✓ | ✓ |
| Urgency dot | ✗ | ✓ green < 4h · amber 4–24h · red > 24h |
| Renter verification badge | ✗ | ✓ Phone Verified / Unverified |
| In-app Reply CTA | ✗ (mailto only) | ✓ opens chat thread |
| Schedule Visit shortcut | ✗ | ✓ opens visit request on renter's behalf |
| Archive | ✗ | ✓ moves to Archived tab |

**FR-DASH-032:** Bulk actions toolbar (appears when ≥ 1 card selected via checkbox): Archive selected · Mark as replied.

**FR-DASH-033:** Landlord's average response time displayed at top of page: "Your avg. response time: 6h 20m" with a coloured pill (green < 4h, amber 4–12h, red > 12h). Tooltip: "Based on your last 30 days of responses."

**FR-DASH-034:** "Group by listing" toggle — when on, inquiries are shown under collapsible listing headers with the listing title and a count badge.

---

### 13.8 Reviews (`/reviews`)

**Current state (Landlord):** Reads reviews from all landlord listings. Shows star rating, comment, pros tags, and existing `landlord_response` if set. Missing: inline respond form, flag action, aggregate summary, category rating breakdown.

**Target design:**

**FR-DASH-040:** Aggregate summary bar at top of page (landlord view only):

```
┌──────────────────────────────────────────────────────────┐
│  ★ 4.3  overall   ·   24 reviews   ·   8 unresponded    │
│  ████████░░  5★  14    ████░░░░░░  3★  4               │
│  ██████░░░░  4★  6     ██░░░░░░░░  2★  0               │
│                         █░░░░░░░░░  1★  0               │
└──────────────────────────────────────────────────────────┘
```

**FR-DASH-041:** Review card — additions to current implementation:

| Element | Current | Required |
|---------|---------|----------|
| Listing title | ✓ | ✓ |
| Renter name | ✗ (not in query) | ✓ via JOIN on `renter_id` |
| Overall star rating | ✓ | ✓ |
| Category ratings (Neighborhood, Noise, Maintenance, Amenities) | ✗ | ✓ compact row of 4 mini-star badges |
| Comment | ✓ | ✓ |
| Pros tags | ✓ | ✓ |
| Cons tags | ✗ | ✓ in red/neutral pill |
| Verified stay badge | ✓ | ✓ |
| Landlord response (display) | ✓ | ✓ |
| **Respond inline form** | ✗ | ✓ see below |
| Flag for removal | ✗ | ✓ see below |

**FR-DASH-042 — Inline respond form:**
- Shown only if `landlord_response` is null
- "Respond to this review" button expands an inline textarea (max 500 chars, char counter)
- Submit button calls `POST /api/reviews/:id/respond`
- On success: response appears in the card; button disappears
- One response per review — once submitted, read-only

**FR-DASH-043 — Flag for removal:**
- Small "Flag review" text link in card footer
- Opens a compact modal: reason selection (Fake / Offensive / Wrong listing) + optional notes (max 200 chars) + Submit
- On submit: routes to admin moderation queue; landlord sees "Under review" badge on that card
- No auto-removal; admin decides

**FR-DASH-044:** Sorting: Newest first (default) · Oldest first · Lowest rated (to prioritise responses) · Unresponded first.

---

### 13.9 Movers (`/movers`, `/movers/[id]`)

**FR-DASH-050:** Movers search page:
- Filters: move date, service area (city/LGA), vehicle type, price range, minimum rating
- Results: grid of mover cards (logo, company name, rating, price range, verified badge, services offered)
- Sorting: Relevance · Rating · Price (low to high)

**FR-DASH-051:** Mover profile (`/movers/[id]`):
- Company header: logo, name, description, service area tags
- Trust indicators: verified badge, insurance coverage amount, fleet info
- Services offered (packing, loading, transport, unpacking) with per-service pricing
- Availability calendar (read-only, shows booked dates greyed out)
- Photo gallery (team + vehicles)
- Reviews (from past customers)
- Sticky CTA: "Book This Mover"

**FR-DASH-052:** Booking flow (bottom sheet on mobile, modal on desktop):
1. Select move date
2. Select time window (Morning 8–12 · Afternoon 12–17 · Evening 17–20)
3. Select services needed
4. Enter pickup and drop-off addresses (autocomplete)
5. See estimated price in ₦
6. Confirm → booking enters `requested` state

**FR-DASH-053:** Post-booking, renter sees booking status card on Dashboard Overview. Actions: Message mover · Cancel (24h notice for full refund).

**FR-DASH-054 (Phase 2):** Mover self-service dashboard: Accept/Decline bookings, update availability, view earnings summary, message customers.

---

### 13.10 Profile (`/profile`)

**FR-DASH-060:** Profile page sections:
- **Personal Info:** First name, last name, email (read-only from auth), phone, avatar upload
- **Verification:** Phone verification (OTP), NIN/BVN *(Phase 2)*
- **Role:** Current role display. Role upgrade (renter → landlord) triggers admin review.
- **Notifications:** Toggle per-channel (push, email) for: messages, visit updates, review responses, booking updates
- **Security:** Change password, active sessions, logout all devices
- **Danger Zone:** Delete account — password re-entry + 30-day deactivation grace period

**FR-DASH-061:** Verification level drives trust badge on listings and in messages:
- Unverified (grey dot)
- Phone Verified (blue shield)
- Fully Verified — phone + NIN/BVN (green shield with tick)

---

### 13.11 Admin Dashboard *(Phase 2)*

**Purpose:** Moderation and platform health. Accessible only to `admin` role.

**FR-DASH-070:** Reports queue: table with listing title, reporter, category, date, status. Inline: Mark Under Review · Action Taken · Resolve. Bulk resolve.

**FR-DASH-071:** User management: search by email/name/role. View profile + activity log. Actions: Suspend · Change role · Delete.

**FR-DASH-072:** Platform analytics: MAU trend · New listings/week · Messages/day · Visit funnel · Mover conversion rate.

**FR-DASH-073:** Listing moderation queue. Approve / Reject with reason. Auto-suspend on fraud flag.

---

### 13.12 Notification System

**FR-DASH-080:** In-app notification centre — bell icon in `SiteHeader`. Unread count badge. Dropdown shows last 10 notifications; "View all" links to `/notifications`.

**FR-DASH-081:** Notification types and triggers:

| Event | Recipient | Channel |
|-------|-----------|---------|
| New message received | Counterpart | In-app + Push |
| New inquiry submitted | Landlord | In-app + Push |
| Visit request submitted | Landlord | In-app + Push |
| Visit approved / rejected | Renter | In-app + Push |
| Visit reminder (2h before) | Both | Push + Email |
| New review on listing | Landlord | In-app |
| Review response posted | Renter | In-app |
| Mover booking confirmed | Renter | In-app + Push + Email |
| Listing approved | Landlord | In-app + Email |
| Report status update | Reporter | Email |

**FR-DASH-082:** Preferences respected. Push disabled → fall back to email. Batch low-priority events (listing view milestones) into a weekly digest rather than individual notifications.

---

### 13.13 Landlord Dashboard — Gap Analysis & Build Priority

Documents the delta between what is currently implemented and what the design spec requires. Ordered by user impact.

| Gap | Current State | Target | Priority |
|-----|--------------|--------|----------|
| `SectionCards` shows fake data | Hardcoded Revenue/Customers/Accounts/Growth | Live landlord metrics: Views · Contact rate · Avg. response time · Approval rate | P0 |
| Inquiries — no urgency signal | Plain date string | Coloured dot: green/amber/red by hours elapsed | P0 |
| Reviews — no inline respond form | `landlord_response` displayed; no way to submit | Inline textarea + submit on card | P0 |
| Visit card — renter name hidden | Not shown to landlord | Name + phone (post-approval) | P0 |
| `/listings/manage` route missing | No landlord listing management screen | Table + status controls (Active/Pause/Delete) | P1 |
| Listing form — no step indicator | Single scrolling page | 4-step form with progress bar | P1 |
| Listing form — no draft save | User loses work on navigate-away | Auto-save to localStorage + Supabase | P1 |
| Nigeria amenities missing | Generic US amenities (EV charging, doorman) | Generator, Borehole, BQ, Security, Prepaid meter | P1 |
| Reviews — no category rating display | Overall star only | Neighborhood / Noise / Maintenance / Amenities mini-rows | P2 |
| Reviews — no flag action | No way to report false review | Flag modal → admin queue | P2 |
| Visit card — no "Mark Completed" | No completed transition from UI | Button on approved+past visits | P2 |
| Visit card — no "Suggest alternative" | Landlord can only Approve or Reject | Date picker + system message in thread | P2 |
| Listing performance chart | Not on dashboard | 7-day views + inquiry rate line chart | P2 |
| Inquiries — no group-by-listing | Flat list | Collapsible sections per listing | P3 |
| Inquiries — no in-app reply CTA | mailto only | Open message thread in-app | P3 |
| Notification centre | Not implemented | Bell icon + dropdown in SiteHeader | P3 |

---

### 13.14 Acceptance Criteria by Dashboard Route

| Route | Renter | Landlord | Mover | Admin |
|-------|--------|----------|-------|-------|
| `/dashboard` | ✓ Overview + stats | ✓ KPIs + inquiries + visits + chart | — | ✓ Platform health |
| `/messages` | ✓ All conversations | ✓ Conversations + quick-reply templates | ✓ Customer chats | ✓ |
| `/visits` | ✓ My requests | ✓ Approve/Reject/Complete/Suggest alt. | — | ✓ |
| `/listings/new` | ✗ | ✓ Stepped form, draft save | ✗ | ✓ |
| `/listings/manage` | ✗ | ✓ Table + status controls | ✗ | ✓ |
| `/inquiries` | ✗ | ✓ Urgency triage, in-app reply, archive | ✗ | ✓ |
| `/reviews` | ✓ Reviews written | ✓ Aggregate summary + inline respond + flag | — | ✓ |
| `/movers` | ✓ Search + book | — | ✓ *(Phase 2)* | ✓ |
| `/profile` | ✓ | ✓ | ✓ | ✓ |

---

### 13.15 Dashboard Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Landlord first response time | < 4 hours median | Message + inquiry timestamps |
| Visit approval rate | > 70% of requests | Visit status logs |
| Dashboard DAU / MAU ratio | > 40% | Session analytics |
| Messages read within 1 hour | > 60% | Read receipt logs |
| Listing form completion rate | > 75% of drafts published | Funnel analytics |
| Profile verification rate | > 50% of active landlords phone-verified | Auth logs |
| Unresponded review rate | < 30% at 7 days | Reviews table |
| Notification opt-out rate | < 20% | Preferences table |

---

## 14. FUTURE EXTENSIONS

- AI recommendations (listing suggestions based on search history)
- Advanced fraud detection (duplicate image hashing, suspicious pricing ML)
- Dynamic pricing for movers (surge pricing on public holiday move dates)
- AR virtual tours (WebXR room scanning via mobile camera)
- NIN/BVN identity verification integration (NIBSS API)
- Rent payment processing in-app (Paystack escrow)
- Lease agreement e-signing (DocuSign / local equivalent)
- Multi-language support (Yoruba, Hausa, Igbo)
- Maintenance request ticketing (tenant → landlord issue tracking)
- Landlord analytics export (CSV/PDF of listing performance)

---

## 15. SUMMARY

Rentas wins by:
- Simplicity
- Trust
- End-to-end experience

