const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Robust authentication middleware
 * Extracts JWT token from HTTP cookies, Authorization header, x-access-token header, or query param.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-Only Cookie
  if (req.cookies && req.cookies.token && req.cookies.token !== 'none') {
    token = req.cookies.token;
  } else if (req.cookies && req.cookies.jwt && req.cookies.jwt !== 'none') {
    token = req.cookies.jwt;
  }
  // 2. Check Authorization Header (Bearer or raw token)
  else if (req.headers.authorization || req.headers.Authorization) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader === 'string') {
      const trimmed = authHeader.trim();
      if (trimmed.toLowerCase().startsWith('bearer ')) {
        const parts = trimmed.split(/\s+/);
        token = parts[parts.length - 1];
      } else {
        token = trimmed;
      }
    }
  }
  // 3. Check x-access-token Header
  else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }
  // 4. Check Query Parameter
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return errorResponse(
      res,
      401,
      'Not authorized, token missing. Include token in HTTP cookie or "Authorization: Bearer <token>" header.'
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, 'User no longer exists');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'User account is suspended/inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Token invalid or expired', error.message);
  }
};

module.exports = { protect };
