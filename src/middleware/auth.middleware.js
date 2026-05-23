import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';
import logger from '#config/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'No token provided' });
    }

    const payload = jwtToken.verify(token);

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (e) {
    logger.warn('Invalid or expired token', { error: e.message });
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};
