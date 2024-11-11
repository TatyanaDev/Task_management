const checkOwnershipOrAdmin = (Model) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const resource = await Model.findById(id);

    if (!resource) {
      return res.status(404).send({ message: `${Model.modelName} not found` });
    }

    if (userRole !== "admin" && resource.user.toString() !== userId.toString()) {
      return res.status(403).send({ message: "Access denied" });
    }

    req.resource = resource;

    next();
  } catch (error) {
    console.error("Authorization error:", error.message);
    res.status(500).send({ message: "Authorization error", error: error.message });
  }
};

module.exports = checkOwnershipOrAdmin;
