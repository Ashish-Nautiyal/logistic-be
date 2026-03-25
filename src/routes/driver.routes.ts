import { Router } from 'express';
import { driverController } from '../controllers';
import { validate, authenticate, isAdminOrManager, isAdmin } from '../middlewares';
import { createDriverSchema, updateDriverSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', driverController.findAll.bind(driverController));
router.get('/available', driverController.getAvailable.bind(driverController));
router.get('/:id', driverController.findById.bind(driverController));
router.get('/:id/stats', driverController.getStats.bind(driverController));
router.post('/', isAdminOrManager, validate(createDriverSchema), driverController.create.bind(driverController));
router.put('/:id', validate(updateDriverSchema), driverController.update.bind(driverController));
router.delete('/:id', isAdmin, driverController.delete.bind(driverController));

export default router;
