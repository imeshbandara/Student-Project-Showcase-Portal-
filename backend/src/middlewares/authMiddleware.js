import jwt from 'jsonwebtoken';
<<<<<<< Updated upstream
import { prisma } from '../app.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: 'User associated with this token not found.' });
=======
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
>>>>>>> Stashed changes
    }

    req.user = user;
    next();
  } catch (error) {
<<<<<<< Updated upstream
    next(error);
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to perform this action.' });
    }

=======
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }
>>>>>>> Stashed changes
    next();
  };
};
