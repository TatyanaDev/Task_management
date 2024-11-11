const { Router } = require("express");
const authentication = require("../middlewares/authentication.mw");
const categoryRouter = require("./category");
const taskRouter = require("./task");
const authRouter = require("./auth");

const router = Router();

router.use("/auth", authRouter);
router.use("/categories", authentication, categoryRouter);
router.use("/tasks", authentication, taskRouter);

module.exports = router;
