import express from 'express';
import { mockLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/mock-login', mockLogin);

export default router;
