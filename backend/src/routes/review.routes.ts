import { Router } from 'express';

const router = Router();

// Phase 2: Review routes
// GET  /api/listings/:id/reviews — get listing reviews (public)
// POST /api/listings/:id/reviews — create review (authenticated renter)
// PUT  /api/reviews/:id — update review (authenticated)
// POST /api/reviews/:id/respond — landlord response (authenticated landlord)

export { router as reviewRoutes };
