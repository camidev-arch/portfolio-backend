import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  listProjects, getProject, createProject, updateProject, deleteProject,
} from '../controllers/projectController.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';

const router = Router();

const projectValidators = [
  body('slug').isString().trim().isLength({ min: 2, max: 80 }).matches(/^[a-z0-9-]+$/),
  body('titleEs').isString().trim().isLength({ min: 1, max: 200 }),
  body('titleEn').isString().trim().isLength({ min: 1, max: 200 }),
  body('descriptionEs').isString().trim().isLength({ min: 1, max: 2000 }),
  body('descriptionEn').isString().trim().isLength({ min: 1, max: 2000 }),
  body('tech').optional().isArray({ max: 30 }),
  body('url').optional({ nullable: true, checkFalsy: true }).isURL(),
  body('repoUrl').optional({ nullable: true, checkFalsy: true }).isURL(),
  body('featured').optional().isBoolean(),
  body('order').optional().isInt({ min: 0, max: 9999 }),
];

router.get('/', listProjects);
router.get('/:slug', param('slug').isString().matches(/^[a-z0-9-]+$/), handleValidation, getProject);

router.post('/', authRequired, adminOnly, projectValidators, handleValidation, createProject);
router.put(
  '/:id',
  authRequired,
  adminOnly,
  param('id').isInt({ min: 1 }),
  projectValidators.map((v) => v.optional()),
  handleValidation,
  updateProject
);
router.delete('/:id', authRequired, adminOnly, param('id').isInt({ min: 1 }), handleValidation, deleteProject);

export default router;
