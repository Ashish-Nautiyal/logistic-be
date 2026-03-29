import { Router } from 'express';
import { orderController } from '../controllers';
import { validate, authenticate, isAdminOrManager, isAdmin } from '../middlewares';
import { createOrderSchema, updateOrderSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/my-orders', orderController.findMyOrders.bind(orderController));
router.get('/', orderController.findAll.bind(orderController));
router.get('/number/:orderNumber', orderController.findByOrderNumber.bind(orderController));
router.get('/:id', orderController.findById.bind(orderController));
router.post('/', isAdminOrManager, validate(createOrderSchema), orderController.create.bind(orderController));
router.put('/:id', isAdminOrManager, validate(updateOrderSchema), orderController.update.bind(orderController));
router.put('/:id/status', orderController.updateStatus.bind(orderController));
router.put('/:id/assign', isAdminOrManager, orderController.assignDriver.bind(orderController));
router.delete('/:id', isAdmin, orderController.delete.bind(orderController));

export default router;
