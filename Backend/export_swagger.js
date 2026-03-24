const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Hospital Token Management API",
      version: "1.0.0",
      description: "API Documentation for Hospital Token Management SaaS",
    },
    servers: [
      {
        url: `http://localhost:5000`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.js"], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
fs.writeFileSync('swagger.json', JSON.stringify(swaggerDocs, null, 2));
console.log('Swagger JSON generated.');
