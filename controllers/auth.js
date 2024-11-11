const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = {
  register: async (req, res) => {
    try {
      const user = await new User(req.body).save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(201).send({ data: { token } });
    } catch (error) {
      console.error("Error register user:", error.message);
      res.status(500).send({ message: "Error register user", error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await user.checkPassword(password))) {
        return res.status(401).send({ message: "Authentication failed" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).send({ data: { token } });
    } catch (error) {
      console.error("Error log a user in:", error.message);
      res.status(500).send({ message: "Error log a user in", error: error.message });
    }
  },
};
