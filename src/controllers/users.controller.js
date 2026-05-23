import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.services.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    const allUsers = await getAllUsers();
    res.status(200).json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    logger.info(`Getting user by id: ${req.params.id}`);

    const user = await getUserById(parseInt(req.params.id));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    logger.info(`Updating user by id: ${req.params.id}`);

    const user = await updateUser(parseInt(req.params.id), req.body);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Successfully updated user',
      user,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    logger.info(`Deleting user by id: ${req.params.id}`);

    const user = await deleteUser(parseInt(req.params.id));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Successfully deleted user',
      user,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};
