function pathHandler(error, req, res, next) {
    return res.json({
        statusCode: error.statusCode || 500,
        message: `${rec.metod} ${req.url} not found path`
    })
  }
  
  export default pathHandler;