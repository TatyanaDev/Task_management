const errorHandler = async (err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).send({
    errors: [{ message: err || "Server error" }],
  });
};

module.exports = errorHandler;
