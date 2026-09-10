const User = require('../models/User');
const Rating = require('../models/Rating');

const updateUserReputation = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const ratings = await Rating.find({ ratee: userId });
  const count = ratings.length;

  let avgRating = 5.0;
  if (count > 0) {
    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    avgRating = parseFloat((sum / count).toFixed(2));
  }

  // Count verified teach skills
  const verifiedCount = (user.skillsToTeach || []).filter((s) => s.isVerified).length;

  // Reputation score calculation
  const baseReputation = 100;
  const sessionPoints = (user.sessionsCompleted || 0) * 10;
  const ratingPoints = Math.round(avgRating * 20);
  const verifiedPoints = verifiedCount * 15;

  const reputationScore = Math.max(0, baseReputation + sessionPoints + ratingPoints + verifiedPoints);

  user.rating = avgRating;
  user.totalRatings = count;
  user.reputationScore = reputationScore;

  await user.save();
  return user;
};

module.exports = {
  updateUserReputation
};
