import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get paginated notifications
router.get('/', authenticate, getNotifications);

// Mark all as read (defined before dynamic param route to prevent conflicts)
router.patch('/read-all', authenticate, markAllAsRead);

// Mark single notification as read
router.patch('/:id/read', authenticate, markAsRead);

export default router;
