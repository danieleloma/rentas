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
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(5000).optional(),
  propertyType: z.enum(['apartment', 'house', 'condo', 'townhouse']),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0).optional(),
  squareFootage: z.number().int().positive().optional(),
  monthlyRent: z.number().positive('Rent must be greater than 0'),
  deposit: z.number().positive().optional(),
  availableFrom: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateListingFormData = z.infer<typeof createListingSchema>;
