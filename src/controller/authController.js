const authService = require('../service/authService');

exports.login = (req, res) => res.json(authService.login(req.body || {}));
