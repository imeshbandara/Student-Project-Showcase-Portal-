import express from 'express';
import { followUser, unfollowUser, getFollowing, getAllUsers, deleteUser, getUserById, updateUser, updateProfile } from '../controllers/userController.js';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/following', authenticate, getFollowing);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);

// Admin only
router.get('/all', authenticate, authorizeRole(['ADMIN']), getAllUsers);
router.get('/:id', authenticate, authorizeRole(['ADMIN']), getUserById);
router.put('/:id', authenticate, authorizeRole(['ADMIN']), updateUser);
router.delete('/:id', authenticate, authorizeRole(['ADMIN']), deleteUser);

export default router;
