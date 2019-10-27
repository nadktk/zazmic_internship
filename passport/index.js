const path = require('path');

const root = path.dirname(process.mainModule.filename);

const { localStrategy, googleStrategy, facebookStrategy } = require(path.join(
  __dirname,
  'strategies.js',
));

const { User } = require(path.join(root, 'models', 'sequelize'));

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else next(new Error('Route needs authentication'));
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
        raw: true,
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
