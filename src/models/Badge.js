const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'award'
  },
  criteria: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
