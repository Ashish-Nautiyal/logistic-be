import { Op } from 'sequelize';
import { Client } from '../models';
import { ClientAttributes } from '../types';

export class ClientService {
  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ rows: ClientAttributes[]; count: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (options?.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${options.search}%` } },
        { email: { [Op.iLike]: `%${options.search}%` } },
        { city: { [Op.iLike]: `%${options.search}%` } },
      ];
    }

    const { rows, count } = await Client.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      rows: rows.map(r => r.toJSON() as ClientAttributes),
      count,
    };
  }

  async findById(id: string): Promise<ClientAttributes | null> {
    const client = await Client.findByPk(id);
    return client ? (client.toJSON() as ClientAttributes) : null;
  }

  async create(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  }): Promise<ClientAttributes> {
    const client = await Client.create(data);
    return client.toJSON() as ClientAttributes;
  }

  async update(id: string, data: Partial<ClientAttributes>): Promise<ClientAttributes> {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error('Client not found');
    }

    await client.update(data);
    return client.toJSON() as ClientAttributes;
  }

  async delete(id: string): Promise<void> {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error('Client not found');
    }

    await client.destroy();
  }
}

export const clientService = new ClientService();
