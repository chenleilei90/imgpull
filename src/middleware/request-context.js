function attachRequestContext(req, res, next) {
  req.requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  next();
}

module.exports = {
  attachRequestContext
};
