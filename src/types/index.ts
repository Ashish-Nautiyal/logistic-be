export type UserRole = 'admin' | 'company' | 'driver';
export type OrderStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
export type VehicleType = 'truck' | 'van' | 'bike';
export type VehicleStatus = 'available' | 'in_use' | 'maintenance';
export type DispatchStatus = 'pending' | 'in_progress' | 'completed';

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleAttributes {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  capacity: number;
  status: VehicleStatus;
  companyId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DriverAttributes {
  id: string;
  userId: string;
  licenseNumber: string;
  vehicleId: string | null;
  isAvailable: boolean;
  currentLocation: { lat: number; lng: number } | null;
  companyId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderAttributes {
  id: string;
  orderNumber: string;
  clientId: string;
  driverId: string | null;
  vehicleId: string | null;
  status: OrderStatus;
  pickupAddress: string;
  pickupCity: string;
  deliveryAddress: string;
  deliveryCity: string;
  weight: number;
  description: string | null;
  deliveryNotes: string | null;
  scheduledDate: Date;
  deliveredAt: Date | null;
  companyId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  sub: string;
  role?: UserRole;
  type?: 'password-reset';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
}
