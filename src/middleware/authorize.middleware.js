import logger from '#config/logger.js';

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      logger.warn('Access forbidden', {
        userId: req.user.id,
        role: req.user.role,
        path: req.path,
        method: req.method,
      });
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Access denied' });
    }

    next();
  };
};
