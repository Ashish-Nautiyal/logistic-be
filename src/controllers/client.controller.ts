import { Request, Response } from 'express';
import { clientService } from '../services';

export class ClientController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await clientService.findAll({ page, limit, search });
      res.json({
        success: true,
        data: {
          clients: result.rows,
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
      const client = await clientService.findById(req.params.id);
      if (!client) {
        res.status(404).json({
          success: false,
          message: 'Client not found',
        });
        return;
      }
      res.json({
        success: true,
        data: client,
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
      const client = await clientService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: client,
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
      const client = await clientService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Client updated successfully',
        data: client,
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
      await clientService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const clientController = new ClientController();
