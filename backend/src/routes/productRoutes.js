import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateProduct } from '../validators/productValidator.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', validateProduct, createProduct);
router.put('/:id', validateProduct, updateProduct);
router.delete('/:id', deleteProduct);

export const productRoutes = router; 