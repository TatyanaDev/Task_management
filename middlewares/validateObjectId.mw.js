const mongoose = require("mongoose");

const validateObjectId = (param) => (req, res, next) => {
  const id = req.params[param];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID" });
  }

  next();
};

module.exports = validateObjectId;
