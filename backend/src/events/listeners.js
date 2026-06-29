import { appEvents } from './eventEmitter.js';
import { prisma } from '../app.js';

/**
 * ============================================================================
 * ARCHITECTURE RULE ENFORCEMENT WARNING:
 * This is the ONLY file allowed to write records to the 'notifications' table.
 * Creating notifications directly in routes or controllers is STRICTLY PROHIBITED
 * to maintain strict event-driven separation of concerns.
 * ============================================================================
 */

// 1. Listen for new projects being created
appEvents.on('ProjectCreated', async ({ studentId, projectId }) => {
  try {
    // Find all followers of this student
    const followers = await prisma.follower.findMany({
      where: { followedId: studentId }
    });

    if (followers.length === 0) return;

    // Create notifications for each follower in the database
    const notificationPromises = followers.map(follower => {
      return prisma.notification.create({
        data: {
          userId: follower.followerId, // recipient of notification
          actorId: studentId,          // student who created project
          type: 'PROJECT_CREATED',
          entityId: projectId
        }
      });
    });

    await Promise.all(notificationPromises);
    console.log(`[Event: ProjectCreated] Created notifications for ${followers.length} followers of user ${studentId}`);
  } catch (error) {
    console.error('[Event: ProjectCreated] Error generating notifications:', error);
  }
});

// 2. Listen for a project being liked
appEvents.on('ProjectLiked', async ({ userId, projectId }) => {
  try {
    // Find the project's owner
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return;

    // Avoid notifying owners about their own likes
    if (project.studentId === userId) return;

    // Create notification for the project owner
    await prisma.notification.create({
      data: {
        userId: project.studentId, // recipient (project owner)
        actorId: userId,          // actor (user who liked)
        type: 'PROJECT_LIKED',
        entityId: projectId
      }
    });

    console.log(`[Event: ProjectLiked] Created notification for project owner ${project.studentId} due to like from ${userId}`);
  } catch (error) {
    console.error('[Event: ProjectLiked] Error generating notification:', error);
  }
});

// 3. Listen for a user being followed
appEvents.on('UserFollowed', async ({ followerId, followedId }) => {
  try {
    // Create notification for the followed user
    await prisma.notification.create({
      data: {
        userId: followedId,   // recipient (followed user)
        actorId: followerId,  // actor (follower)
        type: 'NEW_FOLLOWER',
        entityId: null
      }
    });

    console.log(`[Event: UserFollowed] Created notification for user ${followedId} due to new follower ${followerId}`);
  } catch (error) {
    console.error('[Event: UserFollowed] Error generating notification:', error);
  }
});
