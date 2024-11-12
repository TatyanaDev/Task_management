require("dotenv").config();
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");

const defaultPort = process.env.PORT || 5000;
const dockerPort = process.env.DOCKERPORT || 4000;

const PORT = process.env.RUNNING_IN_DOCKER ? dockerPort : defaultPort;
const HOST = process.env.RUNNING_IN_DOCKER ? "0.0.0.0" : "localhost";

const server = http.createServer(app);
const io = socketIo(server);

app.set("io", io);

app.use((req, res, next) => {
  req.io = io;

  next();
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  let baseURL = `http://${HOST}:${PORT}`;

  if (process.env.NODE_ENV === "production") {
    baseURL = "https://tatyanadev-task-management.onrender.com";
  }

  console.log(`Swagger UI available at ${baseURL}/api-docs\nReal-time updates for task status available at ${baseURL}`);
});
