import express from 'express';
import passport from 'passport';
import { mockLogin, googleCallback, getMe, logout } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Mock login route
router.post('/mock-login', mockLogin);

// Trigger Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

// Get current user (protected route)
router.get('/me', requireAuth, getMe);

// Logout route
router.post('/logout', logout);

export default router;
