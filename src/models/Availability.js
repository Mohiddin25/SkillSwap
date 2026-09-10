const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: [true, 'Day of week is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required (e.g. 17:00)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required (e.g. 19:00)']
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
