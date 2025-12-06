// config/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Employee Management System API",
      version: "1.0.0",
      description: "API documentation for EMS. Authentication via Bearer JWT.",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:5000",
        description: "Local development server",
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
    security: [{ bearerAuth: [] }],
  },

  // 📌 Tell Swagger to scan all route files
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/swagger.json", (req, res) => res.json(swaggerSpec));
}

module.exports = { setupSwagger };
