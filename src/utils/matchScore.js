/**
 * Utility functions for match score calculation logic
 */

const LEVEL_MAP = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3,
  'Expert': 4
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map((num) => parseInt(num, 10));
  return (hours || 0) * 60 + (minutes || 0);
};

const formatMinutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr}`;
};

/**
 * Calculates availability overlap between user A slots and user B slots
 * Returns { scorePercentage, commonSlots, totalOverlapMinutes }
 */
const calculateAvailabilityOverlap = (slotsA = [], slotsB = []) => {
  let totalOverlapMinutes = 0;
  const commonSlots = [];

  for (const slotA of slotsA) {
    for (const slotB of slotsB) {
      // Compare days of week (case-insensitive)
      if (slotA.dayOfWeek.toLowerCase() === slotB.dayOfWeek.toLowerCase()) {
        const startA = parseTimeToMinutes(slotA.startTime);
        const endA = parseTimeToMinutes(slotA.endTime);
        const startB = parseTimeToMinutes(slotB.startTime);
        const endB = parseTimeToMinutes(slotB.endTime);

        const overlapStart = Math.max(startA, startB);
        const overlapEnd = Math.min(endA, endB);

        if (overlapEnd > overlapStart) {
          const overlapMins = overlapEnd - overlapStart;
          totalOverlapMinutes += overlapMins;
          commonSlots.push({
            dayOfWeek: slotA.dayOfWeek,
            startTime: formatMinutesToTime(overlapStart),
            endTime: formatMinutesToTime(overlapEnd),
            durationMinutes: overlapMins
          });
        }
      }
    }
  }

  // Score mapping: 120+ mins (2h) overlap = 100%, 60m = 75%, 30m = 50%, 0 = 0%
  let scorePercentage = 0;
  if (totalOverlapMinutes >= 120) {
    scorePercentage = 100;
  } else if (totalOverlapMinutes >= 60) {
    scorePercentage = 75 + ((totalOverlapMinutes - 60) / 60) * 25;
  } else if (totalOverlapMinutes > 0) {
    scorePercentage = 30 + (totalOverlapMinutes / 60) * 45;
  } else {
    scorePercentage = 0;
  }

  return {
    scorePercentage: Math.min(100, Math.round(scorePercentage)),
    commonSlots,
    totalOverlapMinutes
  };
};

/**
 * Calculates skill level compatibility
 */
const calculateLevelCompatibility = (teacherLevelStr, learnerLevelStr) => {
  const teacherVal = LEVEL_MAP[teacherLevelStr] || 2;
  const learnerVal = LEVEL_MAP[learnerLevelStr] || 1;

  if (teacherVal > learnerVal) {
    return 100; // Perfect: teacher is higher level than learner
  } else if (teacherVal === learnerVal) {
    return 80;  // Peer learning at same level
  } else {
    return 40;  // Learner is asking someone at a lower level
  }
};

/**
 * Calculates location score
 */
const calculateLocationCompatibility = (campusA, campusB) => {
  if (!campusA || !campusB) {
    return 50; // Neutral score when location missing
  }
  if (campusA.trim().toLowerCase() === campusB.trim().toLowerCase()) {
    return 100; // Same campus
  }
  return 30; // Different campus
};

module.exports = {
  LEVEL_MAP,
  parseTimeToMinutes,
  formatMinutesToTime,
  calculateAvailabilityOverlap,
  calculateLevelCompatibility,
  calculateLocationCompatibility
};
