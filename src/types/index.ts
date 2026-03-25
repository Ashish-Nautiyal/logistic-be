export type UserRole = 'admin' | 'manager' | 'driver';
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

export interface ClientAttributes {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleAttributes {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  capacity: number;
  status: VehicleStatus;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderAttributes {
  id: string;
  orderNumber: string;
  clientId: string;
  driverId: string | null;
  status: OrderStatus;
  pickupAddress: string;
  pickupCity: string;
  deliveryAddress: string;
  deliveryCity: string;
  weight: number;
  description: string | null;
  scheduledDate: Date;
  deliveredAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DispatchAttributes {
  id: string;
  orderId: string;
  driverId: string;
  vehicleId: string;
  status: DispatchStatus;
  startTime: Date | null;
  endTime: Date | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
}
