const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler.mw");
const { swaggerUi, swaggerSpec } = require("./swagger");
const router = require("./routes");

const app = express();

const defaultPort = process.env.PORT || 5000;
const dockerPort = process.env.DOCKERPORT || 4000;

const PORT = process.env.RUNNING_IN_DOCKER ? dockerPort : defaultPort;
const origin = process.env.NODE_ENV === "production" ? `${process.env.API_URL}` : `http://localhost:${PORT}`;

app.use(
  cors({
    origin,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());

app.use((req, res, next) => {
  const io = req.app.get("io");

  if (io) {
    req.io = io;
  }

  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", router);

app.use(express.static("public"));

app.use(errorHandler);

module.exports = app;
