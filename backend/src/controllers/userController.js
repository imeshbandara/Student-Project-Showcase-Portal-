import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/db.js';
import { appEvents } from '../events/eventEmitter.js';
import { formatZodIssues, uuidSchema } from '../utils/validation.js';
import { UPLOAD_DIR } from '../middlewares/uploadMiddleware.js';

const userIdParamsSchema = z.object({
  id: uuidSchema,
});

// POST /users/:id/follow
export const followUser = async (req, res, next) => {
  try {
    const validation = userIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const followedId = validation.data.id;
    const followerId = req.user.id;

    if (followedId === followerId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followedId }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User to follow not found.' });
    }

    // Check if relationship already exists
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'You are already following this user.' });
    }

    // Create follow relationship
    await prisma.follower.create({
      data: {
        followerId,
        followedId
      }
    });

    // Emit event
    appEvents.emit('UserFollowed', { followerId, followedId });

    res.status(201).json({ message: 'Successfully followed user.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id/follow
export const unfollowUser = async (req, res, next) => {
  try {
    const validation = userIdParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request parameters.',
        details: formatZodIssues(validation.error)
      });
    }

    const followedId = validation.data.id;
    const followerId = req.user.id;

    // Check if relationship exists
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId
        }
      }
    });

    if (!existingFollow) {
      return res.status(404).json({ error: 'You are not following this user.' });
    }

    // Delete follow relationship
    await prisma.follower.delete({
      where: {
        followerId_followedId: {
          followerId,
          followedId
        }
      }
    });

    res.status(200).json({ message: 'Successfully unfollowed user.' });
  } catch (error) {
    next(error);
  }
};

// GET /users/following (requires auth, recruiter can see list of followed students)
export const getFollowing = async (req, res, next) => {
  try {
    const followerId = req.user.id;

    const following = await prisma.follower.findMany({
      where: { followerId },
      include: {
        followed: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            projects: {
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const followedUsers = following.map((f) => ({
      id: f.followed.id,
      name: f.followed.name,
      email: f.followed.email,
      avatarUrl: f.followed.avatarUrl,
      projectsCount: f.followed.projects.length,
      recentProjects: f.followed.projects.slice(0, 3),
      followedAt: f.createdAt,
    }));

    res.status(200).json({ following: followedUsers });
  } catch (error) {
    next(error);
  }
};
// GET /users/all — Admin only
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { projects: true, followers: true, following: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id — Admin only
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

const updateUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  role: z.enum(['STUDENT', 'RECRUITER', 'ADMIN']),
});

// GET /users/:id — Admin only
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id — Admin only
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const validation = updateUserSchema.safeParse({ name, email, role });
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid update inputs.',
        details: formatZodIssues(validation.error),
      });
    }

    // Check if email already exists on another user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== id) {
      return res.status(400).json({ error: 'Email is already taken by another user.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// PUT /users/profile - authenticated user updates their own profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    let avatarUrl = currentUser.avatarUrl;

    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;

      // Clean up old avatar if it was uploaded locally
      if (currentUser.avatarUrl && currentUser.avatarUrl.startsWith('/uploads/')) {
        const oldFilename = currentUser.avatarUrl.replace('/uploads/', '');
        const oldFilePath = path.resolve(UPLOAD_DIR, oldFilename);
        if (oldFilePath.startsWith(UPLOAD_DIR)) {
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error('Failed to delete old avatar:', err);
          });
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        avatarUrl
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
