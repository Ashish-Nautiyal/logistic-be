import { Op } from 'sequelize';
import { User, Driver, Vehicle, Order } from '../models';
import { UserAttributes, UserRole } from '../types';
import bcrypt from 'bcryptjs';

export class UserService {
  async findAll(options?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }): Promise<{ rows: UserAttributes[]; count: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (options?.role) {
      where.role = options.role;
    }
    if (options?.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${options.search}%` } },
        { email: { [Op.iLike]: `%${options.search}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      rows: rows.map(r => r.toJSON() as UserAttributes),
      count,
    };
  }

  async findById(id: string): Promise<UserAttributes | null> {
    const user = await User.findByPk(id);
    return user ? (user.toJSON() as UserAttributes) : null;
  }

  async findByEmail(email: string): Promise<UserAttributes | null> {
    const user = await User.findOne({ where: { email } });
    return user ? (user.toJSON() as UserAttributes) : null;
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
  }): Promise<UserAttributes> {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone || null,
      role: data.role,
      isActive: true,
    });

    return user.toJSON() as UserAttributes;
  }

  async update(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<UserAttributes> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    await user.update(data);
    return user.toJSON() as UserAttributes;
  }

  async delete(id: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin');
      }
    }

    if (user.role === 'driver') {
      const driver = await Driver.findOne({ where: { userId: user.id } });
      if (driver) {
        const activeOrders = await Order.count({
          where: {
            driverId: driver.id,
            status: { [Op.notIn]: ['delivered', 'cancelled'] },
          },
        });
        if (activeOrders > 0) {
          throw new Error('Cannot delete driver with active orders');
        }
      }
    }

    await user.destroy();
  }
}

export const userService = new UserService();
