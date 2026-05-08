function pathHandler(error, req, res, next) {
    return res.json({
      statusCode: error.statusCode || 500,
      message: `${req.method} ${req.url} not found path`
    });
  }
  
  export default pathHandler;
  