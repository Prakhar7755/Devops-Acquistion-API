import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { signupSchema, signInSchema } from '#validations/auth.validations.js';
import { createUser } from '#services/auth.service.js';
import { findUserByEmail, validatePassword } from '#services/auth.service.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, role, password } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info('User registered successfully');

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (e) {
    logger.error('Signup error', e);
    if (e.message === ' User with this email already exists') {
      return res.status(409).json({ error: 'Email already exist' });
    }
    next(e);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await validatePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User ${user.email} signed in successfully`);

    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (e) {
    logger.error('Sign in error', e);
    next(e);
  }
};

export const signOut = (req, res) => {
  try {
    cookies.clear(res, 'token');
    logger.info('User signed out successfully');
    res.status(200).json({ message: 'User signed out successfully' });
  } catch (e) {
    logger.error('Sign out error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
