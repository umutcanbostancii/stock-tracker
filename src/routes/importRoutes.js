import express from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { importExcel } from '../controllers/importController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/excel', upload.single('file'), asyncHandler(importExcel));

export default router;