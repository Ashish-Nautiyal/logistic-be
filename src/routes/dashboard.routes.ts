import { Router } from 'express';
import { dashboardController } from '../controllers';
import { authenticate, isAdminOrManager } from '../middlewares';

const router = Router();

router.use(authenticate, isAdminOrManager);

router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/order-trends', dashboardController.getOrderTrends.bind(dashboardController));
router.get('/driver-performance', dashboardController.getDriverPerformance.bind(dashboardController));

export default router;
