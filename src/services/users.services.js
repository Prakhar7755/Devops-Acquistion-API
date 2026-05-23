import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (e) {
    logger.error('Error getting all users: ' + e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id));

    if (user.length === 0) {
      return null;
    }
    return user[0];
  } catch (e) {
    logger.error('Error getting user by id: ' + e);
    throw e;
  }
};

export const updateUser = async (id, data) => {
  try {
    const updatedUser = await db
      .update(users)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    if (updatedUser.length === 0) {
      return null;
    }
    return updatedUser[0];
  } catch (e) {
    logger.error('Error updating user: ' + e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    if (deletedUser.length === 0) {
      return null;
    }
    return deletedUser[0];
  } catch (e) {
    logger.error('Error deleting user: ' + e);
    throw e;
  }
};
