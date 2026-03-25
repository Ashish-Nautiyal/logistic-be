import { Order, Driver, Vehicle, Client, User, Dispatch } from '../models';
import { Op } from 'sequelize';

export class DashboardService {
  async getStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
    totalDrivers: number;
    availableDrivers: number;
    totalVehicles: number;
    availableVehicles: number;
    totalClients: number;
    todayDeliveries: number;
    ordersByStatus: Record<string, number>;
    recentOrders: any[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrders,
      pendingOrders,
      inTransitOrders,
      deliveredOrders,
      totalDrivers,
      availableDrivers,
      totalVehicles,
      availableVehicles,
      totalClients,
      recentOrders,
    ] = await Promise.all([
      Order.count(),
      Order.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: { [Op.in]: ['assigned', 'picked_up', 'in_transit'] } } }),
      Order.count({ where: { status: 'delivered' } }),
      Driver.count(),
      Driver.count({ where: { isAvailable: true } }),
      Vehicle.count(),
      Vehicle.count({ where: { status: 'available' } }),
      Client.count(),
      Order.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { model: Client, as: 'client', attributes: ['name'] },
          { model: Driver, as: 'driver', include: [{ model: User, as: 'user', attributes: ['name'] }] },
        ],
      }),
    ]);

    const todayDeliveries = await Order.count({
      where: {
        status: 'delivered',
        deliveredAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    const ordersByStatus = {
      pending: pendingOrders,
      assigned: await Order.count({ where: { status: 'assigned' } }),
      picked_up: await Order.count({ where: { status: 'picked_up' } }),
      in_transit: await Order.count({ where: { status: 'in_transit' } }),
      delivered: deliveredOrders,
      cancelled: await Order.count({ where: { status: 'cancelled' } }),
    };

    return {
      totalOrders,
      pendingOrders,
      inTransitOrders,
      deliveredOrders,
      totalDrivers,
      availableDrivers,
      totalVehicles,
      availableVehicles,
      totalClients,
      todayDeliveries,
      ordersByStatus,
      recentOrders: recentOrders.map(o => o.toJSON()),
    };
  }

  async getOrderTrends(days: number = 7): Promise<any[]> {
    const trends = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dateStr = date.toISOString().split('T')[0];

      const [created, delivered] = await Promise.all([
        Order.count({
          where: {
            createdAt: {
              [Op.gte]: date,
              [Op.lt]: nextDate,
            },
          },
        }),
        Order.count({
          where: {
            status: 'delivered',
            deliveredAt: {
              [Op.gte]: date,
              [Op.lt]: nextDate,
            },
          },
        }),
      ]);

      trends.push({
        date: dateStr,
        created,
        delivered,
      });
    }

    return trends;
  }

  async getDriverPerformance(limit: number = 10): Promise<any[]> {
    const drivers = await Driver.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });

    const performance = await Promise.all(
      drivers.map(async (driver) => {
        const totalOrders = await Order.count({ where: { driverId: driver.id } });
        const completedOrders = await Order.count({
          where: { driverId: driver.id, status: 'delivered' },
        });
        const pendingOrders = await Order.count({
          where: {
            driverId: driver.id,
            status: { [Op.in]: ['assigned', 'picked_up', 'in_transit'] },
          },
        });

        return {
          driverId: driver.id,
          name: driver.user?.name || 'Unknown',
          totalOrders,
          completedOrders,
          pendingOrders,
          completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
        };
      })
    );

    return performance
      .sort((a, b) => b.completedOrders - a.completedOrders)
      .slice(0, limit);
  }
}

export const dashboardService = new DashboardService();
