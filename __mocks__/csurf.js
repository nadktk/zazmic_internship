module.exports = () => (req, res, next) => {
  req.csrfToken = () => 'test';
  next();
};
