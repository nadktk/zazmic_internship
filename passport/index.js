const path = require('path');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');

const { User } = require(path.join(__dirname, '..', 'models', 'sequelize'));

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else next(new Error('Route needs authentication'));
};

exports.passportInit = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

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

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
      },
      async (username, password, done) => {
        try {
          // MySQL operations: find user by email
          const userByEmail = await User.unscoped().findOne({
            where: { email: username },
            raw: true,
          });
          if (
            userByEmail
            && (await bcrypt.compare(password, userByEmail.password))
          ) {
            delete userByEmail.password;
            done(null, userByEmail);
          } else {
            done(null, false);
          }
        } catch (err) {
          done(err);
        }
      },
    ),
  );
};
