import express from 'express';
import asyncHandler from 'express-async-handler';
import { 
  getTransactions, 
  createTransaction 
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', asyncHandler(getTransactions));
router.post('/', asyncHandler(createTransaction));

export default router;