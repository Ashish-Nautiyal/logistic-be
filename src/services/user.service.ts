import { User, Driver, Vehicle } from '../models';
import { UserAttributes, UserRole } from '../types';
import bcrypt from 'bcryptjs';

export class UserService {
  async findAll(options?: {
    page?: number;
    limit?: number;
    role?: UserRole;
  }): Promise<{ rows: UserAttributes[]; count: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (options?.role) {
      where.role = options.role;
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
    role?: UserRole;
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

    await user.destroy();
  }
}

export const userService = new UserService();
