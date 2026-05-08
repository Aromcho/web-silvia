import winston from "../utils/winston.util.js";

function errorHandler(error, req, res, next) {
    winston.ERROR(error.message);
    console.log(error);
    return res.json({
        statusCode: error.statusCode || 500,
        message: error.message || "CODER API ERROR"
    })
  }
  
  export default errorHandler;
  