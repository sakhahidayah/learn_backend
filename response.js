const response = (statusCode, data, message, res) => {
  res.status(statusCode).json({
    payload: data,
    message,
    statusCode,
    pagination: {
      prev: "",
      next: "",
      max: "",
    },
  });
};

module.exports = response;
