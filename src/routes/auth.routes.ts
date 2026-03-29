import { Router } from 'express';
import { authController } from '../controllers';
import { validate, authenticate, authLimiter } from '../middlewares';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));

router.use(authenticate);
router.get('/profile', authController.getProfile.bind(authController));
router.put('/profile', validate(updateProfileSchema), authController.updateProfile.bind(authController));
router.put('/change-password', authController.changePassword.bind(authController));

export default router;
