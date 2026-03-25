import { Router } from 'express';
import { userController } from '../controllers';
import { validate, authenticate, isAdmin } from '../middlewares';
import { createUserSchema, updateUserSchema } from '../validators';

const router = Router();

router.use(authenticate, isAdmin);

router.get('/', userController.findAll.bind(userController));
router.get('/:id', userController.findById.bind(userController));
router.post('/', validate(createUserSchema), userController.create.bind(userController));
router.put('/:id', validate(updateUserSchema), userController.update.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

export default router;
