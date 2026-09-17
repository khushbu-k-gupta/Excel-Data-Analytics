import express from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', verifyToken(['user', 'admin']), getProfile);
router.put('/me', verifyToken(['user', 'admin']), updateProfile);
router.put('/change-password', verifyToken(['user', 'admin']), changePassword);

export default router;
