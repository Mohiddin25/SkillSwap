const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    unique: true
  },
  normalizedName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Programming', 'Design', 'Data', 'Communication', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
