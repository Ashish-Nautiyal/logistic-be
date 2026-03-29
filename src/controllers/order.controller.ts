import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { orderService, driverService } from '../services';
import { OrderStatus } from '../types';

export class OrderController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as OrderStatus;
      const driverId = req.query.driverId as string;
      const clientId = req.query.clientId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const result = await orderService.findAll({
        page,
        limit,
        status,
        driverId,
        clientId,
        startDate,
        endDate,
      });
      res.json({
        success: true,
        data: {
          orders: result.rows,
          pagination: {
            page,
            limit,
            total: result.count,
            totalPages: Math.ceil(result.count / limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const order = await orderService.findById(req.params.id);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }
      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findByOrderNumber(req: Request, res: Response): Promise<void> {
    try {
      const order = await orderService.findByOrderNumber(req.params.orderNumber);
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }
      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const order = await orderService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const order = await orderService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Order updated successfully',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const order = await orderService.updateStatus(req.params.id, status);
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async assignDriver(req: Request, res: Response): Promise<void> {
    try {
      const { driverId } = req.body;
      const order = await orderService.assignDriver(req.params.id, driverId);
      res.json({
        success: true,
        message: 'Driver assigned successfully',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findMyOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const driver = await driverService.findByUserId(userId);
      if (!driver) {
        res.status(404).json({
          success: false,
          message: 'Driver profile not found',
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await orderService.findByDriverId(driver.id, { page, limit });
      res.json({
        success: true,
        data: {
          orders: result.rows,
          pagination: {
            page,
            limit,
            total: result.count,
            totalPages: Math.ceil(result.count / limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await orderService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Order deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const orderController = new OrderController();
