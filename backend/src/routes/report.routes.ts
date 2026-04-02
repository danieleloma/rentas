import { Router } from 'express';

const router = Router();

// Phase 2: Report routes
// POST /api/listings/:id/report — report listing (authenticated)
// GET  /api/reports — list reports (admin only)
// PUT  /api/reports/:id — update report status (admin only)

export { router as reportRoutes };
