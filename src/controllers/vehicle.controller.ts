import { Request, Response } from 'express';
import { vehicleService } from '../services';
import { VehicleStatus, VehicleType } from '../types';

export class VehicleController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as VehicleStatus;
      const vehicleType = req.query.vehicleType as VehicleType;
      const search = req.query.search as string;

      const result = await vehicleService.findAll({ page, limit, status, vehicleType, search });
      res.json({
        success: true,
        data: {
          vehicles: result.rows,
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
      const vehicle = await vehicleService.findById(req.params.id);
      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
        return;
      }
      res.json({
        success: true,
        data: vehicle,
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
      const vehicle = await vehicleService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle,
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
      const vehicle = await vehicleService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle,
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
      await vehicleService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Vehicle deleted successfully',
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
      const vehicles = await vehicleService.getAvailable();
      res.json({
        success: true,
        data: vehicles,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const vehicleController = new VehicleController();
