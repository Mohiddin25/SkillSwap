const { errorResponse } = require('../utils/apiResponse');

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Access denied. Admin privileges required.');
  }
  next();
};

module.exports = { requireAdmin };
