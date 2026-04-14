import { z } from 'zod';

const emailField = z
  .string()
  .email('Invalid email address')
  .transform((s) => s.trim().toLowerCase());

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: emailField,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
    confirmPassword: z.string(),
    phone: z.string().max(20).optional(),
    role: z.enum(['renter', 'landlord']).default('renter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  propertyType: z.enum(['apartment', 'house', 'condo', 'townhouse']),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  // z.coerce.number() handles string → number conversion from HTML inputs.
  // For optional fields we use .catch(undefined) so that an empty input ("" → NaN)
  // is silently treated as absent rather than a validation error.
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.coerce.number().min(0).catch(undefined as unknown as number).optional(),
  squareFootage: z.coerce
    .number()
    .int()
    .positive()
    .catch(undefined as unknown as number)
    .optional(),
  monthlyRent: z.coerce.number().positive('Monthly rent must be greater than 0'),
  deposit: z.coerce
    .number()
    .positive()
    .catch(undefined as unknown as number)
    .optional(),
  availableFrom: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  virtualTourUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  leaseDuration: z.string().max(50).optional(),
  petPolicy: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['allowed', 'not_allowed', 'case_by_case']).optional(),
  ),
  smokingPolicy: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['allowed', 'not_allowed']).optional(),
  ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateListingFormData = z.infer<typeof createListingSchema>;
