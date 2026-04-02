import { Router } from 'express';

const router = Router();

// Phase 3: Mover routes
// GET  /api/movers — search movers (authenticated)
// GET  /api/movers/:id — get mover profile (authenticated)
// POST /api/movers — create mover profile (mover role)
// PUT  /api/movers/:id — update mover profile (mover role)
// POST /api/movers/:id/book — book mover (authenticated renter)
// GET  /api/bookings — list bookings (authenticated)
// PUT  /api/bookings/:id — update booking (authenticated)

export { router as moverRoutes };
