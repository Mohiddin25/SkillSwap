const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ratee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: [true, 'Score is required (1-5)'],
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: '',
    trim: true
  },
  communication: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  teachingQuality: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  punctuality: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  }
}, {
  timestamps: true
});

// Ensure a user can only rate a session once
ratingSchema.index({ session: 1, rater: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
