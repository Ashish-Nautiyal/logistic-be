import { Dispatch, Order, Driver, Vehicle } from '../models';
import { DispatchAttributes, DispatchStatus } from '../types';

export class DispatchService {
  async findAll(options?: {
    page?: number;
    limit?: number;
    driverId?: string;
    status?: DispatchStatus;
  }): Promise<{ rows: DispatchAttributes[]; count: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (options?.driverId) {
      where.driverId = options.driverId;
    }
    if (options?.status) {
      where.status = options.status;
    }

    const { rows, count } = await Dispatch.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Order, as: 'order' },
        { model: Driver, as: 'driver' },
        { model: Vehicle, as: 'vehicle' },
      ],
    });

    return {
      rows: rows.map(r => r.toJSON() as DispatchAttributes),
      count,
    };
  }

  async findById(id: string): Promise<DispatchAttributes | null> {
    const dispatch = await Dispatch.findByPk(id, {
      include: [
        { model: Order, as: 'order' },
        { model: Driver, as: 'driver' },
        { model: Vehicle, as: 'vehicle' },
      ],
    });
    return dispatch ? (dispatch.toJSON() as DispatchAttributes) : null;
  }

  async create(data: {
    orderId: string;
    driverId: string;
    vehicleId: string;
  }): Promise<DispatchAttributes> {
    const order = await Order.findByPk(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const driver = await Driver.findByPk(data.driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    const vehicle = await Vehicle.findByPk(data.vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const dispatch = await Dispatch.create({
      orderId: data.orderId,
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      status: 'pending',
      startTime: null,
      endTime: null,
      notes: null,
    });
    return dispatch.toJSON() as DispatchAttributes;
  }

  async update(id: string, data: {
    driverId?: string;
    vehicleId?: string;
    notes?: string;
  }): Promise<DispatchAttributes> {
    const dispatch = await Dispatch.findByPk(id);
    if (!dispatch) {
      throw new Error('Dispatch not found');
    }

    await dispatch.update(data);
    return dispatch.toJSON() as DispatchAttributes;
  }

  async updateStatus(id: string, status: DispatchStatus, notes?: string): Promise<DispatchAttributes> {
    const dispatch = await Dispatch.findByPk(id);
    if (!dispatch) {
      throw new Error('Dispatch not found');
    }

    const updateData: any = { status };
    if (notes) {
      updateData.notes = notes;
    }

    if (status === 'in_progress' && !dispatch.startTime) {
      updateData.startTime = new Date();
    }

    if (status === 'completed') {
      updateData.endTime = new Date();
    }

    await dispatch.update(updateData);
    return dispatch.toJSON() as DispatchAttributes;
  }

  async delete(id: string): Promise<void> {
    const dispatch = await Dispatch.findByPk(id);
    if (!dispatch) {
      throw new Error('Dispatch not found');
    }

    await dispatch.destroy();
  }
}

export const dispatchService = new DispatchService();
