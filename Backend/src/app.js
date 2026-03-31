const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*', // Allow all origins (for development, adjust in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));

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
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/hospital', require('./modules/hospital/hospital.routes'));
app.use('/api/doctor', require('./modules/doctor/doctor.routes'));
app.use('/api/department', require('./modules/department/department.routes'));
app.use('/api/patient', require('./modules/patient/patient.routes'));
app.use('/api/token', require('./modules/token/token.routes'));
app.use('/api/razorpay', require('./modules/razorpay/razorpay.routes'));
app.use('/api/ads', require('./modules/ads/ads.routes'));
app.use('/api/reports', require('./modules/reports/reports.routes'));
app.use('/api/settings', require('./modules/settings/settings.routes'));
app.use('/api/payment', require('./modules/payment/payment.routes'));
app.use('/api/kiosk', require('./modules/kiosk/kiosk.routes'));

// Global Error Handler
app.use(errorHandler);

module.exports = app;
