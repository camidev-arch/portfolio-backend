import { Router } from 'express';
import { body } from 'express-validator';
import { login, me } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isString().isLength({ min: 8, max: 128 }).withMessage('Password inválida'),
  ],
  handleValidation,
  login
);

router.get('/me', authRequired, me);

export default router;
