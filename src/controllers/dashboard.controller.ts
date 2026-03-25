import { Request, Response } from 'express';
import { dashboardService } from '../services';

export class DashboardController {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getOrderTrends(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const trends = await dashboardService.getOrderTrends(days);
      res.json({
        success: true,
        data: trends,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDriverPerformance(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const performance = await dashboardService.getDriverPerformance(limit);
      res.json({
        success: true,
        data: performance,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const dashboardController = new DashboardController();
