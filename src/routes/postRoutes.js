import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listPublishedPosts, listAllPosts, getPost, createPost, updatePost, deletePost,
} from '../controllers/postController.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';

const router = Router();

const postValidators = [
  body('slug').isString().trim().isLength({ min: 2, max: 120 }).matches(/^[a-z0-9-]+$/),
  body('titleEs').isString().trim().isLength({ min: 1, max: 200 }),
  body('titleEn').isString().trim().isLength({ min: 1, max: 200 }),
  body('excerptEs').isString().trim().isLength({ min: 1, max: 500 }),
  body('excerptEn').isString().trim().isLength({ min: 1, max: 500 }),
  body('contentEs').isString().trim().isLength({ min: 1, max: 50000 }),
  body('contentEn').isString().trim().isLength({ min: 1, max: 50000 }),
  body('published').optional().isBoolean(),
];

router.get('/', listPublishedPosts);
router.get('/admin/all', authRequired, adminOnly, listAllPosts);
router.get('/:slug', param('slug').isString().matches(/^[a-z0-9-]+$/), handleValidation, getPost);

router.post('/', authRequired, adminOnly, postValidators, handleValidation, createPost);
router.put(
  '/:id',
  authRequired,
  adminOnly,
  param('id').isInt({ min: 1 }),
  postValidators.map((v) => v.optional()),
  handleValidation,
  updatePost
);
router.delete('/:id', authRequired, adminOnly, param('id').isInt({ min: 1 }), handleValidation, deletePost);

export default router;
