const AppError = require('../utils/app-error');

function notFoundHandler(req, res) {
  res.status(404).json({
    code: 40400,
    message: '接口不存在',
    data: null
  });
}

function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      data: error.details || null
    });
  }

  console.error('[error]', req.requestId, error);
  return res.status(500).json({
    code: 50000,
    message: '服务器内部错误',
    data: null
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
