const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const swaggerDocument = require('../swagger.json');

const app = express();

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cookieParser());

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://swap-skills-frontend.vercel.app'
];

if (env.CLIENT_URL) {
  const cleanClientUrl = env.CLIENT_URL.replace(/\/$/, '');
  if (!allowedOrigins.includes(cleanClientUrl)) {
    allowedOrigins.push(cleanClientUrl);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1') || cleanOrigin.endsWith('.vercel.app') || cleanOrigin.endsWith('.onrender.com')) {
      return callback(null, origin);
    }
    return callback(null, origin);
  },
  credentials: true
}));

// Logging Middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    environment: env.NODE_ENV
  });
});

// Mount Master API Router
app.use('/api', routes);

// Centralized Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
