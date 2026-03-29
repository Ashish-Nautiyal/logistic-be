import { Op } from 'sequelize';
import { Order, Driver, User, Vehicle } from '../models';
import { OrderAttributes, OrderStatus } from '../types';

export class OrderService {
  async findAll(options?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    driverId?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ rows: OrderAttributes[]; count: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.driverId) {
      where.driverId = options.driverId;
    }
    if (options?.clientId) {
      where.clientId = options.clientId;
    }
    if (options?.startDate && options?.endDate) {
      where.scheduledDate = {
        [Op.between]: [options.startDate, options.endDate],
      };
    }
    if (options?.search) {
      where[Op.or] = [
        { orderNumber: { [Op.iLike]: `%${options.search}%` } },
        { pickupCity: { [Op.iLike]: `%${options.search}%` } },
        { deliveryCity: { [Op.iLike]: `%${options.search}%` } },
        { pickupAddress: { [Op.iLike]: `%${options.search}%` } },
        { deliveryAddress: { [Op.iLike]: `%${options.search}%` } },
      ];
    }

    const { rows, count } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Driver, as: 'driver', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'vehicleType'] },
      ],
    });

    return {
      rows: rows.map(r => r.toJSON() as OrderAttributes),
      count,
    };
  }

  async findById(id: string): Promise<OrderAttributes | null> {
    const order = await Order.findByPk(id, {
      include: [
        { model: Driver, as: 'driver', include: [{ model: User, as: 'user' }] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'vehicleType'] },
      ],
    });
    return order ? (order.toJSON() as OrderAttributes) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderAttributes | null> {
    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        { model: Driver, as: 'driver', include: [{ model: User, as: 'user' }] },
      ],
    });
    return order ? (order.toJSON() as OrderAttributes) : null;
  }

  async create(data: {
    clientId: string;
    pickupAddress: string;
    pickupCity: string;
    deliveryAddress: string;
    deliveryCity: string;
    weight: number;
    description?: string;
    scheduledDate: string;
  }): Promise<OrderAttributes> {
    const orderNumber = await this.generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      clientId: data.clientId,
      status: 'pending',
      pickupAddress: data.pickupAddress,
      pickupCity: data.pickupCity,
      deliveryAddress: data.deliveryAddress,
      deliveryCity: data.deliveryCity,
      weight: data.weight,
      description: data.description || null,
      scheduledDate: new Date(data.scheduledDate),
      deliveredAt: null,
    });

    return order.toJSON() as OrderAttributes;
  }

  async update(id: string, data: Partial<OrderAttributes>): Promise<OrderAttributes> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (data.status === 'cancelled' && ['delivered', 'in_transit'].includes(order.status)) {
      throw new Error('Cannot cancel an order that is already delivered or in transit');
    }

    if (data.vehicleId && data.vehicleId !== order.vehicleId) {
      if (order.vehicleId) {
        await Vehicle.update({ status: 'available' }, { where: { id: order.vehicleId } });
      }
      await Vehicle.update({ status: 'in_use' }, { where: { id: data.vehicleId } });
    }

    if (!data.vehicleId && order.vehicleId) {
      await Vehicle.update({ status: 'available' }, { where: { id: order.vehicleId } });
    }

    await order.update(data);
    return order.toJSON() as OrderAttributes;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderAttributes> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['assigned', 'cancelled'],
      assigned: ['picked_up', 'cancelled'],
      picked_up: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
      if (order.vehicleId) {
        await Vehicle.update({ status: 'available' }, { where: { id: order.vehicleId } });
      }
    }

    await order.update(updateData);
    return order.toJSON() as OrderAttributes;
  }

  async assignDriver(id: string, driverId: string): Promise<OrderAttributes> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be assigned');
    }

    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (!driver.isAvailable) {
      throw new Error('Driver is not available');
    }

    await order.update({ driverId, status: 'assigned' });
    return order.toJSON() as OrderAttributes;
  }

  async delete(id: string): Promise<void> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (['in_transit', 'delivered'].includes(order.status)) {
      throw new Error('Cannot delete an order that is in transit or delivered');
    }

    await order.destroy();
  }

  async findByDriverId(driverId: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<{ rows: OrderAttributes[]; count: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Order.findAndCountAll({
      where: { driverId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Driver, as: 'driver', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
      ],
    });

    return {
      rows: rows.map(r => r.toJSON() as OrderAttributes),
      count,
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}-${random}`;
  }
}

export const orderService = new OrderService();
