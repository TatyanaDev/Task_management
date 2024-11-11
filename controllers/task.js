const mongoose = require("mongoose");
const getWeather = require("../utils/weather");
const Task = require("../models/Task");

module.exports = {
  createTask: async (req, res) => {
    try {
      const userId = req.user._id;
      const weather = req.body?.weather || (await getWeather());

      const task = await new Task({ ...req.body, weather, user: userId }).save();

      res.status(201).send({ data: task });
    } catch (error) {
      console.error("Error creating task:", error.message);
      res.status(500).send({ message: "Error creating task", error: error.message });
    }
  },

  getAllTasks: async (req, res) => {
    try {
      const { status, priority, category, search } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      const query = {};

      if (status) {
        query.status = status;
      }

      if (priority) {
        query.priority = priority;
      }

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
      }

      if (userRole !== "admin") {
        query.user = userId;
      }

      const tasks = await Task.find(query).select("-user").populate({ path: "category", select: "name" });

      if (!tasks.length) {
        return res.status(404).send({ message: "Tasks not found" });
      }

      res.status(200).send({ data: tasks });
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      res.status(500).send({ message: "Error fetching tasks", error: error.message });
    }
  },

  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;

      const task = await Task.findById(id).populate({ path: "category", select: "name" });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const taskData = task.toObject();
      delete taskData.user;

      res.status(200).send({ data: taskData });
    } catch (error) {
      console.error("Error fetching task:", error.message);
      res.status(500).send({ message: "Error fetching task", error: error.message });
    }
  },

  updateTask: async (req, res) => {
    try {
      const { id } = req.params;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).send({ message: "Task not found" });
      }

      const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

      const updatedTaskData = updatedTask.toObject();
      delete updatedTaskData.user;

      req.io.emit("taskUpdated", updatedTaskData);

      res.status(200).send({ data: updatedTask });
    } catch (error) {
      console.error("Error updating task:", error.message);
      res.status(500).send({ message: "Error updating task", error: error.message });
    }
  },

  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).send({ message: "Task not found" });
      }

      const deletedTask = await Task.findByIdAndDelete(id);

      const deletedTaskData = deletedTask ? deletedTask.toObject() : null;
      
      if (deletedTaskData) {
        delete deletedTaskData.user;
      }

      res.status(200).send({ data: deletedTaskData });
    } catch (error) {
      console.error("Error deleting task:", error.message);
      res.status(500).send({ message: "Error deleting task", error: error.message });
    }
  },

  getTasksByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      let tasks;

      if (userRole === "admin") {
        tasks = await Task.find({ category: categoryId }).select("-user").populate({ path: "category", select: "name" });
      } else {
        tasks = await Task.find({ category: categoryId, user: userId }).select("-user").populate({ path: "category", select: "name" });
      }

      if (!tasks.length) {
        return res.status(404).send({ message: "Tasks not found" });
      }

      res.status(200).send({ data: tasks });
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      res.status(500).send({ message: "Error fetching tasks", error: error.message });
    }
  },

  getTasksByPriority: async (req, res) => {
    try {
      const { priority } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).send({ message: "Invalid priority value" });
      }

      let tasks;

      if (userRole === "admin") {
        tasks = await Task.find({ priority }).select("-user").populate({ path: "category", select: "name" });
      } else {
        tasks = await Task.find({ priority, user: userId }).select("-user").populate({ path: "category", select: "name" });
      }

      if (!tasks.length) {
        return res.status(404).send({ message: "Tasks not found" });
      }

      res.status(200).send({ data: tasks });
    } catch (error) {
      console.error("Error fetching task:", error.message);
      res.status(500).send({ message: "Error fetching task", error: error.message });
    }
  },
};
