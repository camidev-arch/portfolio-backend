import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createMessage, listMessages, markRead, deleteMessage,
} from '../controllers/messageController.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';
import { contactLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post(
  '/',
  contactLimiter,
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('subject').optional({ checkFalsy: true }).isString().trim().isLength({ max: 200 }).escape(),
    body('body').isString().trim().isLength({ min: 10, max: 5000 }).escape(),
  ],
  handleValidation,
  createMessage
);

router.get('/', authRequired, adminOnly, listMessages);
router.patch('/:id/read', authRequired, adminOnly, param('id').isInt({ min: 1 }), handleValidation, markRead);
router.delete('/:id', authRequired, adminOnly, param('id').isInt({ min: 1 }), handleValidation, deleteMessage);

export default router;
