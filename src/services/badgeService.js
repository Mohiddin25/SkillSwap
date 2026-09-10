const User = require('../models/User');
const Badge = require('../models/Badge');
const Notification = require('../models/Notification');

/**
 * Standard default badge definitions
 */
const DEFAULT_BADGES = [
  { name: 'First Session', description: 'Completed your first skill swap session', icon: 'zap', criteria: '1 session completed' },
  { name: 'Helpful Mentor', description: 'Taught 3 or more skill sessions', icon: 'heart', criteria: '3 teaching sessions' },
  { name: 'Skill Sharer', description: 'Shared 3 or more skills you can teach', icon: 'share-2', criteria: '3 teach skills added' },
  { name: '5 Sessions Completed', description: 'Completed 5 total swap sessions', icon: 'star', criteria: '5 sessions completed' },
  { name: '10 Sessions Completed', description: 'Completed 10 total swap sessions', icon: 'award', criteria: '10 sessions completed' },
  { name: 'Top Contributor', description: 'Reached Contributor Level 4 or higher', icon: 'shield', criteria: 'Level 4 contributor' },
  { name: 'Highly Rated', description: 'Maintained a 4.8+ rating with 3+ reviews', icon: 'thumbs-up', criteria: '4.8+ rating' },
  { name: 'Knowledge Builder', description: 'Added 3 or more skills to learn', icon: 'book-open', criteria: '3 learn skills added' }
];

/**
 * Ensures system default badges exist in DB
 */
const ensureDefaultBadgesExist = async () => {
  for (const b of DEFAULT_BADGES) {
    await Badge.findOneAndUpdate(
      { name: b.name },
      { $setOnInsert: b },
      { upsert: true, new: true }
    );
  }
};

/**
 * Evaluates and awards badges / updates contributor level for a user
 */
const evaluateUserBadgesAndLevel = async (userId) => {
  await ensureDefaultBadgesExist();

  const user = await User.findById(userId).populate('badges');
  if (!user) return;

  const existingBadgeNames = new Set((user.badges || []).map((b) => b.name));
  const newBadgeIds = [];
  const newlyAwardedBadgeNames = [];

  // Calculate Contributor Level
  let calculatedLevel = 1;
  if (user.sessionsCompleted >= 15) calculatedLevel = 5;
  else if (user.sessionsCompleted >= 10) calculatedLevel = 4;
  else if (user.sessionsCompleted >= 6) calculatedLevel = 3;
  else if (user.sessionsCompleted >= 3) calculatedLevel = 2;

  const levelUpgraded = calculatedLevel > user.contributorLevel;
  user.contributorLevel = calculatedLevel;

  // Fetch all badge docs
  const badgeDocs = await Badge.find({});
  const badgeMap = new Map(badgeDocs.map((b) => [b.name, b]));

  const checkAndAward = (badgeName, condition) => {
    if (condition && !existingBadgeNames.has(badgeName) && badgeMap.has(badgeName)) {
      const bDoc = badgeMap.get(badgeName);
      newBadgeIds.push(bDoc._id);
      newlyAwardedBadgeNames.push(badgeName);
    }
  };

  checkAndAward('First Session', user.sessionsCompleted >= 1);
  checkAndAward('Helpful Mentor', user.teachingSessionsCompleted >= 3);
  checkAndAward('Skill Sharer', (user.skillsToTeach || []).length >= 3);
  checkAndAward('5 Sessions Completed', user.sessionsCompleted >= 5);
  checkAndAward('10 Sessions Completed', user.sessionsCompleted >= 10);
  checkAndAward('Top Contributor', user.contributorLevel >= 4);
  checkAndAward('Highly Rated', user.rating >= 4.8 && user.totalRatings >= 3);
  checkAndAward('Knowledge Builder', (user.skillsToLearn || []).length >= 3);

  if (newBadgeIds.length > 0) {
    user.badges.push(...newBadgeIds);

    for (const bName of newlyAwardedBadgeNames) {
      await Notification.create({
        recipient: userId,
        type: 'badge_earned',
        title: 'New Badge Unlocked! 🏆',
        message: `Congratulations! You have earned the "${bName}" badge!`,
        data: { badgeName: bName }
      });
    }
  }

  if (levelUpgraded) {
    await Notification.create({
      recipient: userId,
      type: 'system',
      title: 'Contributor Level Up! 🚀',
      message: `You are now Contributor Level ${calculatedLevel}!`,
      data: { contributorLevel: calculatedLevel }
    });
  }

  await user.save();
  return user;
};

module.exports = {
  DEFAULT_BADGES,
  ensureDefaultBadgesExist,
  evaluateUserBadgesAndLevel
};
