const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { isValidEmailDomain, sanitizeUser } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const env = require('../config/env');

/**
 * Helper to set HTTP-Only cookie and return standard JSON response
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return successResponse(res, statusCode, message, {
    token,
    user: sanitizeUser(user)
  });
};

/**
 * Register a new student account
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, department, year, campus, bio } = req.body;

    if (!isValidEmailDomain(email, env.ALLOWED_EMAIL_DOMAINS)) {
      return errorResponse(
        res,
        400,
        `Email domain not permitted. Allowed domains: ${env.ALLOWED_EMAIL_DOMAINS.join(', ')}`
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      department,
      year,
      campus: campus || 'Main Campus',
      bio: bio || '',
      skillCredits: 5 // Welcome bonus
    });

    return sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been suspended or deactivated');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    return sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill')
      .populate('badges');

    return successResponse(res, 200, 'Current user retrieved successfully', sanitizeUser(user));
  } catch (error) {
    next(error);
  }
};

/**
 * User Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  return successResponse(res, 200, 'Logout successful. Cookie token cleared.');
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
