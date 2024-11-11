const { body, query, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

const validateRegisterUser = [
  body("email").isEmail().withMessage("Must be a valid email").notEmpty().withMessage("Email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long").notEmpty().withMessage("Password is required"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role value"),
  handleValidationErrors,
];

const validateLoginUser = [
  body("email").isEmail().withMessage("Must be a valid email").notEmpty().withMessage("Email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validateTask = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().optional().isString().withMessage("Description must be a string"),
  body("status").optional().isIn(["pending", "in-progress", "completed"]).withMessage("Status must be either 'pending', 'in-progress' or 'completed'"),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be either 'low', 'medium' or 'high'"),
  body("category").optional().isMongoId().withMessage("Invalid category ID"),
  body("weather").trim().optional().isString().withMessage("Weather must be a string"),
  handleValidationErrors,
];

const validateGetAllTasks = [
  query("status").optional().isIn(["pending", "in-progress", "completed"]).withMessage("Invalid status value"),
  query("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority value"),
  query("category").optional().isMongoId().withMessage("Invalid category ID"),
  query("search").optional().isString().withMessage("Search must be a string"),
  handleValidationErrors,
];

const validateCategory = [
  body("name").trim().notEmpty().withMessage("Category name is required").isString().withMessage("Category name must be a string"),
  handleValidationErrors,
];

module.exports = {
  validateRegisterUser,
  validateLoginUser,
  validateTask,
  validateGetAllTasks,
  validateCategory,
};
