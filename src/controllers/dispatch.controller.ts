import { Request, Response } from 'express';
import { dispatchService } from '../services';
import { DispatchStatus } from '../types';

export class DispatchController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const driverId = req.query.driverId as string;
      const status = req.query.status as DispatchStatus;

      const result = await dispatchService.findAll({ page, limit, driverId, status });
      res.json({
        success: true,
        data: {
          dispatches: result.rows,
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
      const dispatch = await dispatchService.findById(req.params.id);
      if (!dispatch) {
        res.status(404).json({
          success: false,
          message: 'Dispatch not found',
        });
        return;
      }
      res.json({
        success: true,
        data: dispatch,
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
      const dispatch = await dispatchService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Dispatch created successfully',
        data: dispatch,
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
      const dispatch = await dispatchService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Dispatch updated successfully',
        data: dispatch,
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
      const { status, notes } = req.body;
      const dispatch = await dispatchService.updateStatus(req.params.id, status, notes);
      res.json({
        success: true,
        message: 'Dispatch status updated successfully',
        data: dispatch,
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
      await dispatchService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Dispatch deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const dispatchController = new DispatchController();
