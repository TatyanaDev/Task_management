const supertest = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Category = require("../models/Category");
const User = require("../models/User");
const app = require("../app");

const request = supertest(app);

describe("Category API", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    await User.deleteMany({});

    await request.post("/api/auth/register").send({
      email: "testadmin1@example.com",
      password: "password",
      role: "admin",
    });

    const loginResponse = await request.post("/api/auth/login").send({
      email: "testadmin1@example.com",
      password: "password",
    });

    token = loginResponse.body.data.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});
    await mongoose.connection.close();
  });

  // Test for creating a new category
  describe("POST /categories", () => {
    it("should create a new category and return it", async () => {
      const categoryData = { name: "New Category", user: userId };
      const response = await request.post("/api/categories").set("Authorization", `Bearer ${token}`).send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.name).toBe(categoryData.name);
    });
  });

  // Test for getting all categories
  describe("GET /categories", () => {
    it("should get all categories", async () => {
      const response = await request.get("/api/categories").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });
  });

  // Test for getting a category by ID
  describe("GET /categories/:id", () => {
    it("should get a specific category by ID", async () => {
      const category = await new Category({ name: "Specific Category", user: userId }).save();
      const response = await request.get(`/api/categories/${category._id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("Specific Category");
    });
  });

  // Test for updating a category
  describe("PUT /categories/:id", () => {
    it("should update the category and return the updated document", async () => {
      const category = await new Category({ name: "Old Name", user: userId }).save();
      const response = await request.put(`/api/categories/${category._id}`).set("Authorization", `Bearer ${token}`).send({ name: "Updated Name" });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("Updated Name");
    });
  });

  // Test for deleting a category
  describe("DELETE /categories/:id", () => {
    it("should delete the category and confirm deletion", async () => {
      const category = await new Category({ name: "To Delete", user: userId }).save();
      const response = await request.delete(`/api/categories/${category._id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      const findDeleted = await Category.findById(category._id);

      expect(findDeleted).toBeNull();
    });
  });
});
