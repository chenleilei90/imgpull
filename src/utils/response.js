function ok(res, data = {}, message = 'ok') {
  return res.json({
    code: 0,
    message,
    data
  });
}

module.exports = {
  ok
};
