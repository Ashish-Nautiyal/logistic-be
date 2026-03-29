import { Router } from 'express';
import { authController } from '../controllers';
import { validate, authenticate, authLimiter } from '../middlewares';
import { registerSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema, changePasswordSchema } from '../validators';

const router = Router();

router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', authLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));

router.use(authenticate);
router.get('/profile', authController.getProfile.bind(authController));
router.put('/profile', validate(updateProfileSchema), authController.updateProfile.bind(authController));
router.put('/change-password', validate(changePasswordSchema), authController.changePassword.bind(authController));

export default router;
