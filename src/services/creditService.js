const User = require('../models/User');
const SkillCredit = require('../models/SkillCredit');
const env = require('../config/env');

/**
 * Award credits to a teacher upon completing a learning session
 */
const awardSessionCredits = async (session) => {
  const existingTransaction = await SkillCredit.findOne({
    session: session._id,
    type: 'earned'
  });

  if (existingTransaction) {
    return existingTransaction; // Prevent duplicate credit award
  }

  const durationMs = new Date(session.scheduledEnd) - new Date(session.scheduledStart);
  const durationMins = Math.max(30, Math.floor(durationMs / (1000 * 60)));
  const creditsToEarn = Math.max(1, Math.floor(durationMins / 30)) * env.CREDIT_PER_30_MINUTES;

  // Atomic update to avoid race conditions
  const updatedUser = await User.findByIdAndUpdate(
    session.teacher,
    { $inc: { skillCredits: creditsToEarn } },
    { new: true }
  );

  const transaction = await SkillCredit.create({
    user: session.teacher,
    amount: creditsToEarn,
    type: 'earned',
    reason: `Taught session for 30+ minutes`,
    session: session._id,
    balanceAfter: updatedUser.skillCredits
  });

  return transaction;
};

/**
 * Deduct credits from a user (e.g. for booking a 1-way learning session)
 */
const deductCredits = async (userId, amount, reason, sessionId = null) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.skillCredits < amount) {
    throw new Error(`Insufficient Skill Credits. Balance: ${user.skillCredits}, Required: ${amount}`);
  }

  // Atomic update checking balance threshold
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, skillCredits: { $gte: amount } },
    { $inc: { skillCredits: -amount } },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('Transaction failed due to concurrent modification or insufficient balance');
  }

  const transaction = await SkillCredit.create({
    user: userId,
    amount: -amount,
    type: 'spent',
    reason,
    session: sessionId,
    balanceAfter: updatedUser.skillCredits
  });

  return transaction;
};

/**
 * Get user credit balance and transaction history
 */
const getUserCreditHistory = async (userId) => {
  const user = await User.findById(userId).select('skillCredits');
  const history = await SkillCredit.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('session');

  return {
    balance: user ? user.skillCredits : 0,
    history
  };
};

module.exports = {
  awardSessionCredits,
  deductCredits,
  getUserCreditHistory
};
