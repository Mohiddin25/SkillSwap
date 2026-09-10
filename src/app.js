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
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: env.CLIENT_URL || '*',
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
