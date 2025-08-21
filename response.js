// response.js - Helper untuk standardized API response
const response = (statusCode, data, message, res) => {
  const responseData = {
    status: statusCode < 400 ? "success" : "error",
    statusCode: statusCode,
    message: message || "",
    data: data,
    timestamp: new Date().toISOString(),
  };

  // Log untuk debugging
  if (statusCode >= 400) {
    console.error(`❌ API Error [${statusCode}]:`, message);
  } else {
    console.log(`✅ API Success [${statusCode}]:`, message);
  }

  return res.status(statusCode).json(responseData);
};

module.exports = response;
