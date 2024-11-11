const supertest = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");
const app = require("../app");

const request = supertest(app);

describe("Auth API", () => {
  beforeAll(async () => await mongoose.connect(process.env.MONGODB_URI_TEST));

  beforeEach(async () => await User.deleteMany({}));

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test for creating a new user
  describe("POST /auth/register", () => {
    it("should create a new user and return token", async () => {
      const userData = { email: "testuser@example.com", password: "password123", role: "user" };
      const response = await request.post("/api/auth/register").send(userData);

      expect(response.statusCode).toEqual(201);
      expect(response.body.data).toHaveProperty("token");
    });

    it("should return 500 if registration fails", async () => {
      jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.reject(new Error("Failed to save user")));

      const userData = { email: "testuser@example.com", password: "password123", role: "user" };
      const response = await request.post("/api/auth/register").send(userData);

      expect(response.statusCode).toEqual(500);
      expect(response.body.message).toEqual("Error register user");
    });
  });

  // Test for user login
  describe("POST /auth/login", () => {
    const userData = { email: "testuser@example.com", password: "password123" };

    beforeEach(async () => await new User(userData).save());

    it("should login an existing user and return token", async () => {
      const response = await request.post("/api/auth/login").send(userData);

      expect(response.statusCode).toEqual(200);
      expect(response.body.data).toHaveProperty("token");
    });

    it("should return 401 if login fails", async () => {
      const userData = { email: "wronguser@example.com", password: "wrongpassword" };

      const response = await request.post("/api/auth/login").send(userData);

      expect(response.statusCode).toEqual(401);
      expect(response.body.message).toEqual("Authentication failed");
    });
  });
});
