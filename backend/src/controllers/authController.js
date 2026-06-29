import jwt from 'jsonwebtoken';
<<<<<<< Updated upstream
import { prisma } from '../app.js';

export const mockLogin = async (req, res, next) => {
  try {
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const assignedRole = role || 'STUDENT';
    if (!['STUDENT', 'RECRUITER', 'ADMIN'].includes(assignedRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be STUDENT, RECRUITER, or ADMIN.' });
    }

    // Find user or create if not exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          role: assignedRole,
          googleId: `mock-google-id-${Date.now()}-${Math.floor(Math.random() * 100000)}`
        }
      });
    } else {
      // If user exists but role doesn't match requested role, update it (useful for testing different roles with same email)
      if (role && user.role !== role) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role }
        });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful (mock)',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
=======

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.SESSION_SECRET, {
    expiresIn: '7d',
  });
};

export const googleCallback = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  // Generate JWT token for the user
  const token = generateToken(req.user.id);

  // Set JWT as an HttpOnly cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true if in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // For cross-origin cookies in dev vs prod
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Redirect to frontend dashboard or home
  res.redirect(`${process.env.FRONTEND_URL}/`);
};

export const getMe = (req, res) => {
  // req.user is set by requireAuth middleware
  res.status(200).json({ user: req.user });
};

export const logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
>>>>>>> Stashed changes
};
