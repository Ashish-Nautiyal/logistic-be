import { Op } from 'sequelize';
import { Vehicle, Driver } from '../models';
import { VehicleAttributes, VehicleStatus, VehicleType } from '../types';

export class VehicleService {
  async findAll(options?: {
    page?: number;
    limit?: number;
    status?: VehicleStatus;
    vehicleType?: VehicleType;
    search?: string;
  }): Promise<{ rows: VehicleAttributes[]; count: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.vehicleType) {
      where.vehicleType = options.vehicleType;
    }
    if (options?.search) {
      where.plateNumber = { [Op.iLike]: `%${options.search}%` };
    }

    const { rows, count } = await Vehicle.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Driver,
        as: 'assignedDriver',
        attributes: ['id'],
      }],
    });

    return {
      rows: rows.map(r => r.toJSON() as VehicleAttributes),
      count,
    };
  }

  async findById(id: string): Promise<VehicleAttributes | null> {
    const vehicle = await Vehicle.findByPk(id, {
      include: [{
        model: Driver,
        as: 'assignedDriver',
      }],
    });
    return vehicle ? (vehicle.toJSON() as VehicleAttributes) : null;
  }

  async create(data: {
    plateNumber: string;
    vehicleType: VehicleType;
    capacity: number;
    status?: VehicleStatus;
  }): Promise<VehicleAttributes> {
    const existingVehicle = await Vehicle.findOne({ where: { plateNumber: data.plateNumber } });
    if (existingVehicle) {
      throw new Error('Vehicle with this plate number already exists');
    }

    const vehicle = await Vehicle.create({
      plateNumber: data.plateNumber,
      vehicleType: data.vehicleType,
      capacity: data.capacity,
      status: data.status || 'available',
    });
    return vehicle.toJSON() as VehicleAttributes;
  }

  async update(id: string, data: Partial<VehicleAttributes>): Promise<VehicleAttributes> {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (data.plateNumber && data.plateNumber !== vehicle.plateNumber) {
      const existingVehicle = await Vehicle.findOne({ where: { plateNumber: data.plateNumber } });
      if (existingVehicle) {
        throw new Error('Vehicle with this plate number already exists');
      }
    }

    await vehicle.update(data);
    return vehicle.toJSON() as VehicleAttributes;
  }

  async delete(id: string): Promise<void> {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const assignedDriver = await Driver.findOne({ where: { vehicleId: id } });
    if (assignedDriver) {
      await assignedDriver.update({ vehicleId: null });
    }

    await vehicle.destroy();
  }

  async getAvailable(): Promise<VehicleAttributes[]> {
    const vehicles = await Vehicle.findAll({
      where: { status: 'available' },
      order: [['createdAt', 'DESC']],
    });
    return vehicles.map(v => v.toJSON() as VehicleAttributes);
  }
}

export const vehicleService = new VehicleService();
