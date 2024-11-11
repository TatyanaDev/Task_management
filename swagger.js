const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.RUNNING_IN_DOCKER ? process.env.DOCKERPORT || 4000 : process.env.PORT || 5000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "A simple API to manage tasks and categories",
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        Task: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              example: "Task title",
            },
            description: {
              type: "string",
              example: "Task description",
            },
            status: {
              type: "string",
              enum: ["pending", "in-progress", "completed"],
              example: "pending",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              example: "low",
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2024-11-08T14:02:06.752Z",
            },
            category: {
              oneOf: [
                { type: "null", example: null },
                {
                  type: "object",
                  properties: {
                    _id: {
                      type: "string",
                      example: "672e1b521cb7a463b01d666b",
                    },
                    name: {
                      type: "string",
                      example: "Category name",
                    },
                  },
                },
              ],
            },
            weather: {
              type: "string",
              example: "Rain",
            },
          },
        },
        Category: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              example: "in progress",
            },
          },
        },
        UserRegistration: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "email.user@gmail.com",
            },
            password: {
              type: "string",
              example: "my secret password",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user",
            },
          },
        },
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "email.user@gmail.com",
            },
            password: {
              type: "string",
              example: "my secret password",
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    example: "field",
                  },
                  value: {
                    type: "string",
                    example: "short",
                  },
                  msg: {
                    type: "string",
                    example: "Password must be at least 6 characters long",
                  },
                  path: {
                    type: "string",
                    example: "password",
                  },
                  location: {
                    type: "string",
                    example: "body",
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
