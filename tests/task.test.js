const supertest = require("supertest");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Category = require("../models/Category");
const User = require("../models/User");
const Task = require("../models/Task");
const app = require("../app");

const request = supertest(app);

describe("Task API", () => {
  let token;
  let userId;
  let io;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    await User.deleteMany({});

    await request.post("/api/auth/register").send({
      email: "testadmin2@example.com",
      password: "password",
      role: "admin",
    });

    const loginResponse = await request.post("/api/auth/login").send({
      email: "testadmin2@example.com",
      password: "password",
    });

    token = loginResponse.body.data.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;

    const server = require("http").createServer(app);
    io = socketIo(server);
    app.set("io", io);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => await Task.deleteMany());

  // Test for creating a new task
  describe("POST /tasks", () => {
    it("should create a new task and return it", async () => {
      const taskData = { title: "Test Task title", description: "Test task description", status: "pending", priority: "medium", category: "6655e572ef734c7412b98c0e", weather: "Sunny", user: userId };
      const response = await request.post("/api/tasks").set("Authorization", `Bearer ${token}`).send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.title).toEqual(taskData.title);
    });
  });

  // Test for getting all tasks
  describe("GET /tasks", () => {
    it("should get all tasks", async () => {
      // Create a dummy task to ensure the database is not empty
      await new Task({ title: "Test Task title", description: "Test task description", status: "pending", priority: "medium", category: "6655e572ef734c7412b98c0e", weather: "Sunny", user: userId }).save();

      const response = await request.get("/api/tasks").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // Test for getting a task by ID
  describe("GET /tasks/:id", () => {
    it("should get a specific task by ID", async () => {
      const task = await new Task({ title: "Test Task title", description: "Test task description", status: "pending", priority: "medium", category: "6655e572ef734c7412b98c0e", weather: "Sunny", user: userId }).save();
      const response = await request.get(`/api/tasks/${task._id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toEqual(task.title);
    });
  });

  // Test for updating a task
  describe("PUT /tasks/:id", () => {
    it("should update the task and return the updated document", async () => {
      const task = await new Task({ title: "Old Title", description: "Updated task", status: "pending", priority: "high", category: "6655e572ef734c7412b98c0e", weather: "Sunny", user: userId }).save();
      const response = await request.put(`/api/tasks/${task._id}`).set("Authorization", `Bearer ${token}`).send({ title: "Updated Title", category: "6655e61b7eb96d8e93ed4815" });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toEqual("Updated Title");
    });
  });

  // Test for deleting a task
  describe("DELETE /tasks/:id", () => {
    it("should delete the task and confirm deletion", async () => {
      const task = await new Task({ title: "To Delete", description: "Delete this task", status: "pending", priority: "low", category: "6655e572ef734c7412b98c0e", user: userId }).save();
      const response = await request.delete(`/api/tasks/${task._id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      const foundTask = await Task.findById(task._id);

      expect(foundTask).toBeNull();
    });
  });

  //  Test for getting a tasks by category
  describe("GET /tasks/category/:categoryId", () => {
    it("should get all tasks with with the specified category", async () => {
      const category = await new Category({ name: "New Category", user: userId }).save();
      await new Task({ title: "Test Task", description: "Test Description", category: category._id, priority: "high", user: userId }).save();

      const response = await request.get(`/api/tasks/category/${category._id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].category._id.toString()).toEqual(category._id.toString());
    });

    it("should return 404 if no tasks found with the specified category", async () => {
      const category = await new Category({ name: "Empty Category", user: userId }).save();
      const response = await request.get(`/api/tasks/category/${category._id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should return 400 for an invalid category ID", async () => {
      const response = await request.get("/api/tasks/category/123").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  //  Test for getting a tasks by priority
  describe("GET /tasks/priority/:priority", () => {
    it("should get all tasks with the specified priority", async () => {
      await Task.create([
        { title: "Task Low", priority: "low", user: userId },
        { title: "Task Medium", priority: "medium", user: userId },
        { title: "Task High", priority: "high", user: userId },
      ]);

      const response = await request.get("/api/tasks/priority/high").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((task) => task.priority === "high")).toBe(true);
    });

    it("should return 404 if no tasks found with the specified priority", async () => {
      const response = await request.get("/api/tasks/priority/medium").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should return 400 for an invalid priority value", async () => {
      const response = await request.get("/api/tasks/priority/unknown").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });
});
