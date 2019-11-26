const {
  localStrategy,
  googleStrategy,
  facebookStrategy,
} = require('./strategies');

const { User } = require('../models/sequelize');

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else {
    res.status(401).send();
  }
};

exports.passportInit = (passport) => {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const userById = await User.findOne({
        where: { id },
      });
      if (userById) done(null, userById);
      else throw new Error('User not found');
    } catch (err) {
      done(err);
    }
  });

  // Use strategies
  passport.use(localStrategy);
  passport.use(googleStrategy);
  passport.use(facebookStrategy);
};
