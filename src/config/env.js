const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap',
  JWT_SECRET: process.env.JWT_SECRET || 'skillswap_super_secret_jwt_key_2026_campus_app',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ALLOWED_EMAIL_DOMAINS: process.env.ALLOWED_EMAIL_DOMAINS
    ? process.env.ALLOWED_EMAIL_DOMAINS.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
    : [],
  CREDIT_PER_30_MINUTES: parseInt(process.env.CREDIT_PER_30_MINUTES || '1', 10),
  
  // Matching Engine Configurable Weights
  MATCH_WEIGHTS: {
    skill: 0.50,
    availability: 0.25,
    level: 0.15,
    location: 0.10
  }
};
