import express from 'express';
<<<<<<< Updated upstream
import { mockLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/mock-login', mockLogin);
=======
import passport from 'passport';
import { googleCallback, getMe, logout } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Trigger Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

// Get current user (protected route)
router.get('/me', requireAuth, getMe);

// Logout route
router.post('/logout', logout);
>>>>>>> Stashed changes

export default router;
