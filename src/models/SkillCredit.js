const mongoose = require('mongoose');

const skillCreditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'spent', 'bonus', 'refund', 'penalty'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  },
  balanceAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const SkillCredit = mongoose.model('SkillCredit', skillCreditSchema);

module.exports = SkillCredit;
