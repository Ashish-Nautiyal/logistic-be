import { Op } from 'sequelize';
import { Driver, User, Vehicle, Order } from '../models';
import { DriverAttributes } from '../types';

export class DriverService {
  async findAll(options?: {
    page?: number;
    limit?: number;
    available?: boolean;
    search?: string;
  }): Promise<{ rows: DriverAttributes[]; count: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (options?.available !== undefined) {
      where.isAvailable = options.available;
    }

    const include: any[] = [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
    ];

    if (options?.search) {
      include[0].where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${options.search}%` } },
          { email: { [Op.iLike]: `%${options.search}%` } },
        ],
      };
      include[0].required = true;
    }

    const { rows, count } = await Driver.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include,
    });

    return {
      rows: rows.map(r => r.toJSON() as DriverAttributes),
      count,
    };
  }

  async findById(id: string): Promise<DriverAttributes | null> {
    const driver = await Driver.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: Vehicle, as: 'vehicle' },
      ],
    });
    return driver ? (driver.toJSON() as DriverAttributes) : null;
  }

  async findByUserId(userId: string): Promise<DriverAttributes | null> {
    const driver = await Driver.findOne({
      where: { userId },
      include: [
        { model: User, as: 'user' },
        { model: Vehicle, as: 'vehicle' },
      ],
    });
    return driver ? (driver.toJSON() as DriverAttributes) : null;
  }

  async create(data: {
    userId: string;
    licenseNumber: string;
    currentLocation?: { lat: number; lng: number };
  }): Promise<DriverAttributes> {
    const existingDriver = await Driver.findOne({ where: { userId: data.userId } });
    if (existingDriver) {
      throw new Error('User already has a driver profile');
    }

    const user = await User.findByPk(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'driver') {
      await user.update({ role: 'driver' });
    }

    const driver = await Driver.create({
      userId: data.userId,
      licenseNumber: data.licenseNumber,
      currentLocation: data.currentLocation || null,
      isAvailable: true,
    });
    return driver.toJSON() as DriverAttributes;
  }

  async update(id: string, data: {
    licenseNumber?: string;
    vehicleId?: string | null;
    isAvailable?: boolean;
    currentLocation?: { lat: number; lng: number } | null;
  }): Promise<DriverAttributes> {
    const driver = await Driver.findByPk(id);
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (data.vehicleId !== undefined) {
      if (data.vehicleId) {
        const vehicle = await Vehicle.findByPk(data.vehicleId);
        if (!vehicle) {
          throw new Error('Vehicle not found');
        }
        if (vehicle.status !== 'available') {
          throw new Error('Vehicle is not available');
        }
        await vehicle.update({ status: 'in_use' });
        
        if (driver.vehicleId) {
          await Vehicle.update({ status: 'available' }, { where: { id: driver.vehicleId } });
        }
      } else {
        if (driver.vehicleId) {
          await Vehicle.update({ status: 'available' }, { where: { id: driver.vehicleId } });
        }
      }
    }

    await driver.update(data);
    return driver.toJSON() as DriverAttributes;
  }

  async updateLicense(id: string, licenseNumber: string): Promise<DriverAttributes> {
    const driver = await Driver.findByPk(id);
    if (!driver) {
      throw new Error('Driver not found');
    }

    await driver.update({ licenseNumber });
    return driver.toJSON() as DriverAttributes;
  }

  async delete(id: string): Promise<void> {
    const driver = await Driver.findByPk(id);
    if (!driver) {
      throw new Error('Driver not found');
    }

    const activeOrders = await Order.count({
      where: {
        driverId: id,
        status: { [Op.notIn]: ['delivered', 'cancelled'] },
      },
    });

    if (activeOrders > 0) {
      throw new Error('Cannot delete driver with active orders');
    }

    const userId = driver.userId;

    if (driver.vehicleId) {
      await Vehicle.update({ status: 'available' }, { where: { id: driver.vehicleId } });
    }

    await driver.destroy();

    if (userId) {
      await User.destroy({ where: { id: userId } });
    }
  }

  async getAvailable(): Promise<DriverAttributes[]> {
    const drivers = await Driver.findAll({
      where: { isAvailable: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Vehicle, as: 'vehicle' },
      ],
      order: [['createdAt', 'DESC']],
    });
    return drivers.map(d => d.toJSON() as DriverAttributes);
  }

  async getStats(id: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
  }> {
    const totalOrders = await Order.count({ where: { driverId: id } });
    const completedOrders = await Order.count({ where: { driverId: id, status: 'delivered' } });
    const pendingOrders = await Order.count({
      where: { driverId: id, status: { [Op.in]: ['pending', 'assigned', 'picked_up', 'in_transit'] } },
    });

    return { totalOrders, completedOrders, pendingOrders };
  }
}

export const driverService = new DriverService();
