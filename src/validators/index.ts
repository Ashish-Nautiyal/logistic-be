import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'company', 'driver']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(1).max(50),
  vehicleType: z.enum(['truck', 'van', 'bike']),
  capacity: z.number().positive(),
  status: z.enum(['available', 'in_use', 'maintenance']).optional(),
});

export const updateVehicleSchema = z.object({
  plateNumber: z.string().min(1).max(50).optional(),
  vehicleType: z.enum(['truck', 'van', 'bike']).optional(),
  capacity: z.number().positive().optional(),
  status: z.enum(['available', 'in_use', 'maintenance']).optional(),
});

export const createDriverSchema = z.object({
  userId: z.string().uuid(),
  licenseNumber: z.string().min(1).max(50),
});

export const updateDriverSchema = z.object({
  licenseNumber: z.string().min(1).max(50).optional(),
  vehicleId: z.string().uuid().nullable().optional(),
  isAvailable: z.boolean().optional(),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }).nullable().optional(),
});

export const updateDriverLicenseSchema = z.object({
  licenseNumber: z.string().min(1).max(50),
});

export const createOrderSchema = z.object({
  clientId: z.string().uuid(),
  pickupAddress: z.string().min(1),
  pickupCity: z.string().min(1).max(100),
  deliveryAddress: z.string().min(1),
  deliveryCity: z.string().min(1).max(100),
  weight: z.number().positive(),
  description: z.string().optional(),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});

export const updateOrderSchema = z.object({
  pickupAddress: z.string().optional(),
  pickupCity: z.string().max(100).optional(),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().max(100).optional(),
  weight: z.number().positive().optional(),
  description: z.string().optional(),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
});

export const createDispatchSchema = z.object({
  orderId: z.string().uuid(),
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid(),
});

export const updateDispatchSchema = z.object({
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateDispatchInput = z.infer<typeof createDispatchSchema>;
