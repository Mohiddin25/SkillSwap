const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skillsOffered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  skillsRequested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  matchScore: {
    type: Number,
    default: 0
  },
  message: {
    type: String,
    default: '',
    trim: true
  },
  proposedTimeSlots: [{
    dayOfWeek: String,
    startTime: String,
    endTime: String
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired', 'completed'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

module.exports = SwapRequest;
