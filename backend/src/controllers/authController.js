import jwt from 'jsonwebtoken';
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
};
