// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Employee Management System API",
      version: "1.0.0",
      description:
        "API documentation for Employee Management & HR Information System (EMS).\nAuthentication via Bearer JWT.",
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
      schemas: {
        Employee: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64a1f..." },
            firstName: { type: "string", example: "Vaishnavi" },
            lastName: { type: "string", example: "Kumar" },
            email: { type: "string", example: "vaishnavi@company.com" },
            phoneNumber: { type: "string", example: "9876543210" },
            role: { type: "string", example: "employee" },
          },
        },
        PersonalDetails: {
          type: "object",
          properties: {
            officialEmail: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            dob: { type: "string", format: "date" },
            gender: { type: "string" },
            photo: { type: "string", description: "URL to photo" },
            aadharUpload: {
              type: "object",
              properties: {
                filename: { type: "string" },
                path: { type: "string" },
              },
            },
            panUpload: {
              type: "object",
              properties: {
                filename: { type: "string" },
                path: { type: "string" },
              },
            },
          },
        },
        Education: {
          type: "object",
          properties: {
            officialEmail: { type: "string" },
            schoolName10: { type: "string" },
            year10: { type: "integer" },
            cgpa10: { type: "number" },
            // ... abbreviated for brevity
          },
        },
        Professional: {
          type: "object",
          properties: {
            officialEmail: { type: "string" },
            employeeId: { type: "string" },
            dateOfJoining: { type: "string", format: "date" },
            role: { type: "string" },
            department: { type: "string" },
            salary: { type: "string" },
            hasExperience: { type: "boolean" },
            experiences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  companyName: { type: "string" },
                  jobTitle: { type: "string" },
                  startDate: { type: "string", format: "date" },
                  endDate: { type: "string", format: "date" },
                  relivingLetter: { type: "object" },
                  salarySlips: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
        Project: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            projectName: { type: "string" },
            assignedTo: { type: "string" },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            status: { type: "string" },
          },
        },
        TimeEntry: {
          type: "object",
          properties: {
            employeeEmail: { type: "string" },
            date: { type: "string", format: "date" },
            category: { type: "string" },
            projectName: { type: "string" },
            hours: { type: "number" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            msg: { type: "string" },
            token: { type: "string" },
            mustFillPersonalDetails: { type: "boolean" },
            mustFillEducationDetails: { type: "boolean" },
            mustFillProfessionalDetails: { type: "boolean" },
            employee: { $ref: "#/components/schemas/Employee" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // swagger-jsdoc will also look for JSDoc comments if you add paths here
  apis: [], // keep empty because we define paths below programmatically
};

// --- Minimal paths: adapt/extend to cover all your endpoints ---
options.definition.paths = {
  "/employee/register": {
    post: {
      tags: ["Auth"],
      summary: "Register employee",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string" },
                phoneNumber: { type: "string" },
                password: { type: "string" },
                confirmPassword: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Employee" } } } },
        "400": { description: "Bad Request" },
      },
    },
  },

  "/employee/login": {
    post: {
      tags: ["Auth"],
      summary: "Login employee",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } },
          },
        },
      },
      responses: {
        "200": { description: "Login success", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
        "401": { description: "Unauthorized" },
      },
    },
  },

  "/employee/all": {
    get: {
      tags: ["Employee"],
      summary: "Get all employees",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "List of employees",
          content: {
            "application/json": {
              schema: { type: "object", properties: { msg: { type: "string" }, count: { type: "integer" }, employees: { type: "array", items: { $ref: "#/components/schemas/Employee" } } } },
            },
          },
        },
      },
    },
  },

  "/employee/{id}": {
    get: {
      tags: ["Employee"],
      summary: "Get employee by id",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Employee", content: { "application/json": { schema: { $ref: "#/components/schemas/Employee" } } } },
        "404": { description: "Not Found" },
      },
    },
  },

  "/personal/save": {
    post: {
      tags: ["Personal"],
      summary: "Save or update personal details (multipart/form-data)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                photo: { type: "string", format: "binary" },
                aadharUpload: { type: "string", format: "binary" },
                panUpload: { type: "string", format: "binary" },
                marriageCertificate: { type: "string", format: "binary" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                dob: { type: "string" },
                // add more form fields as needed
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Saved", content: { "application/json": { schema: { type: "object" } } } },
      },
    },
  },

  "/education/save": {
    post: {
      tags: ["Education"],
      summary: "Save education details (multipart/form-data)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                certificate10: { type: "string", format: "binary" },
                certificate12: { type: "string", format: "binary" },
                certificateUG: { type: "string", format: "binary" },
                hasMTech: { type: "boolean" },
                hasCourse: { type: "boolean" },
                // add other fields
              },
            },
          },
        },
      },
      responses: { "200": { description: "Saved" } },
    },
  },

  "/professional/save": {
    post: {
      tags: ["Professional"],
      summary: "Save professional details (supports dynamic experience file fields)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                employeeId: { type: "string" },
                dateOfJoining: { type: "string", format: "date" },
                role: { type: "string" },
                // experiences must be sent as JSON text field (stringified) and files separately
                experiences: {
                  type: "string",
                  description: "Stringified JSON array of experiences; file fields should match experiences[0][relivingLetter], experiences[0][salarySlips], etc.",
                },
              },
            },
          },
        },
      },
      responses: { "200": { description: "Saved" } },
    },
  },

  "/project/save": {
    post: {
      tags: ["Project"],
      summary: "Create project",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/Project" } } },
      },
      responses: { "201": { description: "Created" } },
    },
  },

  "/timesheet/create": {
    post: {
      tags: ["Timesheet"],
      summary: "Create time entry",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TimeEntry" } } } },
      responses: { "200": { description: "Created" } },
    },
  },
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  // optional: expose raw JSON
  app.get("/swagger.json", (req, res) => res.json(swaggerSpec));
}

module.exports = { setupSwagger, swaggerSpec };
