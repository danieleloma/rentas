import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const createListingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  propertyType: z.enum(['apartment', 'house', 'condo', 'townhouse']),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0).optional(),
  squareFootage: z.number().int().positive().optional(),
  monthlyRent: z.number().positive(),
  deposit: z.number().positive().optional(),
  availableFrom: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  virtualTourUrl: z.string().url().optional().or(z.literal('')),
  leaseDuration: z.string().max(50).optional(),
  petPolicy: z.enum(['allowed', 'not_allowed', 'case_by_case']).optional(),
  smokingPolicy: z.enum(['allowed', 'not_allowed']).optional(),
});

const updateListingSchema = createListingSchema.partial();

router.get('/', optionalAuth, ListingController.list);
router.get('/favorites', authenticate, ListingController.getFavorites);
router.get('/:id', optionalAuth, ListingController.getById);
router.post(
  '/',
  authenticate,
  authorize('landlord', 'admin'),
  validate(createListingSchema),
  ListingController.create,
);
router.put(
  '/:id',
  authenticate,
  authorize('landlord', 'admin'),
  validate(updateListingSchema),
  ListingController.update,
);
router.delete('/:id', authenticate, authorize('landlord', 'admin'), ListingController.delete);
router.post('/:id/favorite', authenticate, ListingController.toggleFavorite);

export { router as listingRoutes };
