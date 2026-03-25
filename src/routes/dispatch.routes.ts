import { Router } from 'express';
import { dispatchController } from '../controllers';
import { validate, authenticate, isAdminOrManager, isAdmin } from '../middlewares';
import { createDispatchSchema, updateDispatchSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', dispatchController.findAll.bind(dispatchController));
router.get('/:id', dispatchController.findById.bind(dispatchController));
router.post('/', isAdminOrManager, validate(createDispatchSchema), dispatchController.create.bind(dispatchController));
router.put('/:id', isAdminOrManager, validate(updateDispatchSchema), dispatchController.update.bind(dispatchController));
router.put('/:id/status', dispatchController.updateStatus.bind(dispatchController));
router.delete('/:id', isAdmin, dispatchController.delete.bind(dispatchController));

export default router;
