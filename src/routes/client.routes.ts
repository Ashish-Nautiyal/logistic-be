import { Router } from 'express';
import { clientController } from '../controllers';
import { validate, authenticate, isAdminOrManager, isAdmin } from '../middlewares';
import { createClientSchema, updateClientSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', clientController.findAll.bind(clientController));
router.get('/:id', clientController.findById.bind(clientController));
router.post('/', isAdminOrManager, validate(createClientSchema), clientController.create.bind(clientController));
router.put('/:id', isAdminOrManager, validate(updateClientSchema), clientController.update.bind(clientController));
router.delete('/:id', isAdmin, clientController.delete.bind(clientController));

export default router;
