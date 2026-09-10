const Availability = require('../models/Availability');
const { parseTimeToMinutes } = require('../utils/matchScore');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Get current user availability slots
 * GET /api/availability/me
 */
const getMyAvailability = async (req, res, next) => {
  try {
    const slots = await Availability.find({ userId: req.user._id }).sort({ dayOfWeek: 1, startTime: 1 });
    return successResponse(res, 200, 'Availability slots retrieved', slots);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new availability slot
 * POST /api/availability
 */
const createSlot = async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, timezone } = req.body;

    const formattedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();
    if (!VALID_DAYS.includes(formattedDay)) {
      return errorResponse(res, 400, `Invalid day of week. Must be one of: ${VALID_DAYS.join(', ')}`);
    }

    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);

    if (startMins >= endMins) {
      return errorResponse(res, 400, 'startTime must be strictly before endTime');
    }

    // Check overlap with existing user slots
    const existingSlots = await Availability.find({
      userId: req.user._id,
      dayOfWeek: formattedDay
    });

    for (const slot of existingSlots) {
      const eStart = parseTimeToMinutes(slot.startTime);
      const eEnd = parseTimeToMinutes(slot.endTime);

      const overlap = Math.max(startMins, eStart) < Math.min(endMins, eEnd);
      if (overlap) {
        return errorResponse(
          res,
          409,
          `Overlapping availability slot exists on ${formattedDay} (${slot.startTime} - ${slot.endTime})`
        );
      }
    }

    const slot = await Availability.create({
      userId: req.user._id,
      dayOfWeek: formattedDay,
      startTime,
      endTime,
      timezone: timezone || 'UTC'
    });

    return successResponse(res, 201, 'Availability slot created successfully', slot);
  } catch (error) {
    next(error);
  }
};

/**
 * Update availability slot
 * PUT /api/availability/:id
 */
const updateSlot = async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, timezone } = req.body;
    const slot = await Availability.findOne({ _id: req.params.id, userId: req.user._id });
    if (!slot) {
      return errorResponse(res, 404, 'Availability slot not found');
    }

    const newDay = dayOfWeek ? dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase() : slot.dayOfWeek;
    const newStart = startTime || slot.startTime;
    const newEnd = endTime || slot.endTime;

    if (!VALID_DAYS.includes(newDay)) {
      return errorResponse(res, 400, `Invalid day of week. Must be one of: ${VALID_DAYS.join(', ')}`);
    }

    const startMins = parseTimeToMinutes(newStart);
    const endMins = parseTimeToMinutes(newEnd);

    if (startMins >= endMins) {
      return errorResponse(res, 400, 'startTime must be strictly before endTime');
    }

    // Check overlap excluding current slot
    const existingSlots = await Availability.find({
      userId: req.user._id,
      dayOfWeek: newDay,
      _id: { $ne: slot._id }
    });

    for (const s of existingSlots) {
      const eStart = parseTimeToMinutes(s.startTime);
      const eEnd = parseTimeToMinutes(s.endTime);

      if (Math.max(startMins, eStart) < Math.min(endMins, eEnd)) {
        return errorResponse(res, 409, `Overlapping slot exists on ${newDay} (${s.startTime} - ${s.endTime})`);
      }
    }

    slot.dayOfWeek = newDay;
    slot.startTime = newStart;
    slot.endTime = newEnd;
    if (timezone) slot.timezone = timezone;

    await slot.save();
    return successResponse(res, 200, 'Availability slot updated successfully', slot);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete availability slot
 * DELETE /api/availability/:id
 */
const deleteSlot = async (req, res, next) => {
  try {
    const slot = await Availability.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!slot) {
      return errorResponse(res, 404, 'Availability slot not found');
    }
    return successResponse(res, 200, 'Availability slot deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAvailability,
  createSlot,
  updateSlot,
  deleteSlot
};
