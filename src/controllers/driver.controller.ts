import { Request, Response } from 'express';
import { driverService, userService } from '../services';

export class DriverController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const available = req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await driverService.findAll({ page, limit, available, search });
      res.json({
        success: true,
        data: {
          drivers: result.rows,
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
      const driver = await driverService.findById(req.params.id);
      if (!driver) {
        res.status(404).json({
          success: false,
          message: 'Driver not found',
        });
        return;
      }
      res.json({
        success: true,
        data: driver,
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
      const driver = await driverService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Driver created successfully',
        data: driver,
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
      const driver = await driverService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Driver updated successfully',
        data: driver,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateLicense(req: Request, res: Response): Promise<void> {
    try {
      const driver = await driverService.updateLicense(req.params.id, req.body.licenseNumber);
      res.json({
        success: true,
        message: 'Driver license updated successfully',
        data: driver,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await driverService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Driver deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAvailable(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await driverService.getAvailable();
      res.json({
        success: true,
        data: drivers,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await driverService.getStats(req.params.id);
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

  async registerWithUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone, licenseNumber, currentLocation } = req.body;
      
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
        return;
      }

      const user = await userService.create({
        name,
        email,
        password,
        phone: phone || undefined,
        role: 'driver',
      });

      const driver = await driverService.create({
        userId: user.id,
        licenseNumber,
        currentLocation: currentLocation || null,
      });

      res.status(201).json({
        success: true,
        message: 'Driver registered successfully',
        data: { user, driver },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const driverController = new DriverController();
