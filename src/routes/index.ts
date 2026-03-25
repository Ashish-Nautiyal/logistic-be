import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import clientRoutes from './client.routes';
import vehicleRoutes from './vehicle.routes';
import driverRoutes from './driver.routes';
import orderRoutes from './order.routes';
import dispatchRoutes from './dispatch.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/orders', orderRoutes);
router.use('/dispatch', dispatchRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
