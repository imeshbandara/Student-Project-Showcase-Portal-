import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import errorHandler from './middlewares/errorHandler.js';
import { PrismaClient } from '@prisma/client';
<<<<<<< Updated upstream
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import userRoutes from './routes/userRoutes.js';
import './events/listeners.js';
=======
import authRoutes from './routes/authRoutes.js';
>>>>>>> Stashed changes

dotenv.config();

const app = express();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json()); // JSON body parsing
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // Request logger
app.use(passport.initialize()); // Initialize Passport

// Serve static upload files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/users', userRoutes);


// Health check route
app.get('/health', async (req, res, next) => {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
