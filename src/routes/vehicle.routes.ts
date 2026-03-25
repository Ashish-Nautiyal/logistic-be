import { Router } from 'express';
import { vehicleController } from '../controllers';
import { validate, authenticate, isAdminOrManager, isAdmin } from '../middlewares';
import { createVehicleSchema, updateVehicleSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', vehicleController.findAll.bind(vehicleController));
router.get('/available', vehicleController.getAvailable.bind(vehicleController));
router.get('/:id', vehicleController.findById.bind(vehicleController));
router.post('/', isAdminOrManager, validate(createVehicleSchema), vehicleController.create.bind(vehicleController));
router.put('/:id', isAdminOrManager, validate(updateVehicleSchema), vehicleController.update.bind(vehicleController));
router.delete('/:id', isAdmin, vehicleController.delete.bind(vehicleController));

export default router;
