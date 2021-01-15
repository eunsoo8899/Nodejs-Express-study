const { User } = require('../models/user');

let auth = (req, res, next) => {
  // we need token in here
  let token = req.cookies.x_auth;

  // make findByToken in models/user.js before write here
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true,
      });
    req.token = token;
    req.user = user;
    next()
  });
};

module.exports = { auth };