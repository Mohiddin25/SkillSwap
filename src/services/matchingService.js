const User = require('../models/User');
const Availability = require('../models/Availability');
const env = require('../config/env');
const {
  calculateAvailabilityOverlap,
  calculateLevelCompatibility,
  calculateLocationCompatibility
} = require('../utils/matchScore');
const { sanitizeUser } = require('../utils/helpers');

/**
 * Calculates detailed match score between User A (searching user) and User B (candidate)
 */
const calculateUserMatch = (userA, userB, userAAvailability = [], userBAvailability = []) => {
  const weights = env.MATCH_WEIGHTS;

  // 1. Skill Compatibility (50%)
  const teachMapB = new Map();
  (userB.skillsToTeach || []).forEach((item) => {
    const sId = item.skill._id ? item.skill._id.toString() : item.skill.toString();
    teachMapB.set(sId, item);
  });

  const teachMapA = new Map();
  (userA.skillsToTeach || []).forEach((item) => {
    const sId = item.skill._id ? item.skill._id.toString() : item.skill.toString();
    teachMapA.set(sId, item);
  });

  const matchedTheyTeachWhatIWant = [];
  (userA.skillsToLearn || []).forEach((learnItem) => {
    const sId = learnItem.skill._id ? learnItem.skill._id.toString() : learnItem.skill.toString();
    if (teachMapB.has(sId)) {
      const teachItem = teachMapB.get(sId);
      matchedTheyTeachWhatIWant.push({
        skill: learnItem.skill,
        desiredLevel: learnItem.desiredLevel,
        teacherLevel: teachItem.skillLevel,
        isVerified: teachItem.isVerified
      });
    }
  });

  const matchedITeachWhatTheyWant = [];
  (userB.skillsToLearn || []).forEach((learnItem) => {
    const sId = learnItem.skill._id ? learnItem.skill._id.toString() : learnItem.skill.toString();
    if (teachMapA.has(sId)) {
      const teachItem = teachMapA.get(sId);
      matchedITeachWhatTheyWant.push({
        skill: learnItem.skill,
        desiredLevel: learnItem.desiredLevel,
        teacherLevel: teachItem.skillLevel,
        isVerified: teachItem.isVerified
      });
    }
  });

  let rawSkillScore = 0;
  const hasDirectMatch = matchedTheyTeachWhatIWant.length > 0;
  const hasReverseMatch = matchedITeachWhatTheyWant.length > 0;

  if (hasDirectMatch && hasReverseMatch) {
    rawSkillScore = 100; // Perfect 2-way swap
  } else if (hasDirectMatch) {
    rawSkillScore = 60;  // 1-way swap (learner can use Skill Credits)
  } else {
    rawSkillScore = 0;   // No relevant teach skill for user A
  }

  const skillScoreComponent = rawSkillScore * weights.skill;

  // 2. Availability Overlap (25%)
  const availabilityResult = calculateAvailabilityOverlap(userAAvailability, userBAvailability);
  const availabilityScoreComponent = availabilityResult.scorePercentage * weights.availability;

  // 3. Skill Level Compatibility (15%)
  let rawLevelScore = 50;
  if (matchedTheyTeachWhatIWant.length > 0) {
    const primaryMatch = matchedTheyTeachWhatIWant[0];
    rawLevelScore = calculateLevelCompatibility(primaryMatch.teacherLevel, primaryMatch.desiredLevel);
  }
  const levelScoreComponent = rawLevelScore * weights.level;

  // 4. Location Proximity (10%)
  const rawLocationScore = calculateLocationCompatibility(userA.campus, userB.campus);
  const locationScoreComponent = rawLocationScore * weights.location;

  // Extensible Bonus Factors (Reputation & Verified Skills)
  let bonus = 0;
  if (userB.rating >= 4.5) bonus += 2;
  if (userB.teachingSessionsCompleted >= 5) bonus += 2;
  const isAnyVerified = matchedTheyTeachWhatIWant.some((m) => m.isVerified);
  if (isAnyVerified) bonus += 2;

  const totalMatchScore = Math.min(100, Math.round(
    skillScoreComponent +
    availabilityScoreComponent +
    levelScoreComponent +
    locationScoreComponent +
    bonus
  ));

  return {
    candidate: sanitizeUser(userB),
    matchScore: totalMatchScore,
    skillScore: Math.round(skillScoreComponent),
    availabilityScore: Math.round(availabilityScoreComponent),
    levelScore: Math.round(levelScoreComponent),
    locationScore: Math.round(locationScoreComponent),
    matchedSkills: {
      theyTeachWhatIWant: matchedTheyTeachWhatIWant,
      iTeachWhatTheyWant: matchedITeachWhatTheyWant
    },
    commonAvailability: availabilityResult.commonSlots
  };
};

/**
 * Finds and ranks compatible matches for a user
 */
const findMatchesForUser = async (userId, options = {}) => {
  const {
    minScore = 0,
    skill = null,
    department = null,
    year = null,
    skillLevel = null,
    campus = null,
    availabilityDay = null,
    page = 1,
    limit = 10
  } = options;

  const userA = await User.findById(userId)
    .populate('skillsToTeach.skill')
    .populate('skillsToLearn.skill');

  if (!userA) {
    throw new Error('User not found');
  }

  const userAAvailability = await Availability.find({ userId });

  // Exclude current user, inactive users, and blocked users
  const excludedIds = [userId, ...(userA.blockedUsers || [])];

  const candidateQuery = {
    _id: { $nin: excludedIds },
    isActive: true
  };

  if (department) candidateQuery.department = department;
  if (year) candidateQuery.year = year;
  if (campus) candidateQuery.campus = campus;

  const candidates = await User.find(candidateQuery)
    .populate('skillsToTeach.skill')
    .populate('skillsToLearn.skill');

  // Fetch availabilities for candidate users
  const candidateIds = candidates.map((c) => c._id);
  let availabilityQuery = { userId: { $in: candidateIds } };
  if (availabilityDay) {
    availabilityQuery.dayOfWeek = new RegExp(`^${availabilityDay}$`, 'i');
  }

  const allAvailabilities = await Availability.find(availabilityQuery);
  const availabilityMap = new Map();
  allAvailabilities.forEach((slot) => {
    const uid = slot.userId.toString();
    if (!availabilityMap.has(uid)) {
      availabilityMap.set(uid, []);
    }
    availabilityMap.get(uid).push(slot);
  });

  const matches = [];

  for (const candidate of candidates) {
    const candidateAvail = availabilityMap.get(candidate._id.toString()) || [];

    // Optional skill filtering
    if (skill) {
      const teachesTargetSkill = candidate.skillsToTeach.some((item) =>
        item.skill && (item.skill.name.toLowerCase().includes(skill.toLowerCase()) ||
        item.skill.normalizedName.toLowerCase().includes(skill.toLowerCase()))
      );
      if (!teachesTargetSkill) continue;
    }

    if (skillLevel) {
      const teachesLevel = candidate.skillsToTeach.some((item) =>
        item.skillLevel.toLowerCase() === skillLevel.toLowerCase()
      );
      if (!teachesLevel) continue;
    }

    const matchData = calculateUserMatch(userA, candidate, userAAvailability, candidateAvail);

    if (matchData.matchScore >= minScore) {
      matches.push(matchData);
    }
  }

  // Sort by match score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedMatches = matches.slice(startIndex, startIndex + limitNum);

  return {
    totalMatches: matches.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(matches.length / limitNum) || 1,
    matches: paginatedMatches
  };
};

module.exports = {
  calculateUserMatch,
  findMatchesForUser
};
