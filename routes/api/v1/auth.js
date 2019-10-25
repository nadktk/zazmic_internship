const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');
const passport = require('passport');

const root = path.dirname(process.mainModule.filename);

const { infoLogger } = require(path.join(root, 'logger', 'logger.js'));
const { userIsValid } = require(path.join(root, 'utils', 'validation.js'));
const { User } = require(path.join(root, 'models', 'sequelize'));
const { USERDATA_ERR } = require(path.join(root, 'utils', 'error-messages'));

const router = express.Router();

/**
 * @route   POST api/v1/registration
 * @desc    New user registration
 */

router.post(
  '/registration',
  asyncHandler(async (req, res, next) => {
    if (!userIsValid(req.body)) throw new Error(USERDATA_ERR);

    // MySQL operations: create new user
    const newUser = await User.create(req.body);

    // passport login
    req.login(newUser, (err) => {
      if (err) next(err);
      else {
        // logging success
        infoLogger.log({
          level: 'info',
          message: `User ${newUser.id} was successfully registered`,
        });

        delete newUser.password;
        res.json({ data: newUser });
      }
    });
  }),
);

/**
 * @route   POST api/v1/login
 * @desc    User login route
 */

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.json({ data: req.user });
});

/**
 * @route   POST api/v1/logout
 * @desc    Destroys user's session
 */

router.post('/logout', (req, res, next) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) next(err);
    else {
      res.clearCookie('sid');
      res.send();
    }
  });
});

module.exports = router;
