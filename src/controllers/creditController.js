const { getUserCreditHistory } = require('../services/creditService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get current user credit balance
 * GET /api/credits/balance
 */
const getBalance = async (req, res, next) => {
  try {
    const data = await getUserCreditHistory(req.user._id);
    return successResponse(res, 200, 'Skill Credit balance retrieved', {
      balance: data.balance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user credit transaction history
 * GET /api/credits/history
 */
const getHistory = async (req, res, next) => {
  try {
    const data = await getUserCreditHistory(req.user._id);
    return successResponse(res, 200, 'Skill Credit history retrieved', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalance,
  getHistory
};
