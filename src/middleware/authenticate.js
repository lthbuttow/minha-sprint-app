const authService = require('../service/authService');

module.exports = (req, res, next) => {
  const authorization = req.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    const error = new Error('Token de autenticação ausente.');
    error.statusCode = 401;
    return next(error);
  }
  try {
    req.user = authService.verify(authorization.slice(7));
    return next();
  } catch (error) {
    return next(error);
  }
};
