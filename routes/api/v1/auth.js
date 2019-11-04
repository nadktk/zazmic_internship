const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const root = path.dirname(process.mainModule.filename);

const { loginLimiter } = require(path.join(root, 'limiter', 'limiter.js'));

const authService = require(path.join(root, 'services', 'auth-service.js'));
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

router.post(
  '/login',
  loginLimiter,
  passport.authenticate('local'),
  (req, res) => {
    res.json({ data: req.user });
  },
);

/**
 * @route   POST api/v1/logout
 * @desc    Destroys user's session
 */

router.post('/logout', authService.logout);

/**
 * Routes for JWT
 */

/**
 * @route   POST api/v1/jwtsend
 * @desc    Generates and sends JWT token with userName from payload
 */

router.post('/jwtsend', (req, res, next) => {
  const payload = {
    userName: req.query.userName,
  };
  // sign token
  jwt.sign(payload, process.env.SECRET, { expiresIn: 60 }, (err, token) => {
    if (err) next(err);
    else {
      res.json({
        data: { token },
      });
    }
  });
});

/**
 * @route   GET api/v1/jwtcheck
 * @desc    Checks JWT token from query params
 */

router.get('/jwtcheck', (req, res, next) => {
  jwt.verify(req.query.token, process.env.SECRET, (err, decoded) => {
    if (err) next(err);
    else {
      res.json({ data: decoded });
    }
  });
});

module.exports = router;
