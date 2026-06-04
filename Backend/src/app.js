const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const errorHandler = require('./middlewares/errorHandler');

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://hospitaltoken.ratnamstaging.in',

        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);
// Middlewares
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(mongoSanitize());

// Swagger Setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Token Management API',
      version: '1.0.0',
      description: 'API Documentation for Hospital Token Management SaaS',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Root route
app.get('/', (req, res) => {
  res.send(
    'Hospital Token Management API is running. Check /api-docs for documentation.'
  );
});

// Import and use routes
app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter, require('./modules/auth/auth.routes'));
app.use('/api/hospital', require('./modules/hospital/hospital.routes'));
app.use('/api/doctor', require('./modules/doctor/doctor.routes'));
app.use('/api/department', require('./modules/department/department.routes'));
app.use('/api/patient', require('./modules/patient/patient.routes'));
app.use('/api/token', require('./modules/token/token.routes'));
app.use('/api/razorpay', require('./modules/razorpay/razorpay.routes'));
app.use('/api/ads', require('./modules/ads/ads.routes'));
app.use('/api/notifications', require('./modules/notification/notification.routes'));
app.use('/api/reports', require('./modules/reports/reports.routes'));
app.use('/api/settings', require('./modules/settings/settings.routes'));
app.use('/api/payment', require('./modules/payment/payment.routes'));
app.use('/api/kiosk', require('./modules/kiosk/kiosk.routes'));
app.use(
  '/api/subscription',
  require('./modules/subscription/subscription.routes')
);
app.use('/api/wallet', require('./modules/wallet/wallet.routes'));

// Global Error Handler
app.use(errorHandler);

module.exports = app;
