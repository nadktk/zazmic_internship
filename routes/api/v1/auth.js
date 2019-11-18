const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const root = path.dirname(process.mainModule.filename);

const { loginLimiter } = require(path.join(root, 'limiter', 'limiter.js'));

const authService = require(path.join(root, 'services', 'auth-service.js'));
const { sendVerification } = require(path.join(
  root,
  'services',
  'mail-service.js',
));
const { infoLogger } = require(path.join(root, 'logger', 'logger.js'));
const { User } = require(path.join(root, 'models', 'sequelize'));
const { userCreateValidation, userLoginValidation } = require(path.join(
  root,
  'validation',
));

const router = express.Router();

/**
 * @route   POST api/v1/registration
 * @desc    New user registration
 */

router.post(
  '/registration',
  userCreateValidation,
  asyncHandler(async (req, res, next) => {
    // MySQL operations: find user by email
    let user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      const newUserData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      };

      // MySQL operations: create new user if it doesn't exist
      user = await User.create(newUserData);
    }

    // check if user was verified
    if (user.is_verified) {
      res.json({ data: user });
    } else {
      // sign token
      jwt.sign(
        { id: user.id },
        process.env.SECRET,
        { expiresIn: '1h' },
        async (err, emailToken) => {
          if (err) next(err);
          else {
            try {
              // send email
              await sendVerification(emailToken, user);

              // send response
              delete user.password;
              res.json({ data: user });
            } catch (error) {
              next(error);
            }
          }
        },
      );
    }
  }),
);

/**
 * @route   POST api/v1/registration/verify
 * @desc    Email verification
 */

router.post(
  '/registration/verify',
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.body.token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        res.status(403).json({ errors: [{ msg: 'Try to register again' }] });
      } else {
        // const user = await User.findOne();
        const user = await User.findByPk(decoded.id);
        await user.update({ is_verified: true });

        // passport login
        req.login(user, (error) => {
          if (error) next(error);
          else {
            // logging success
            infoLogger.log({
              level: 'info',
              message: `User ${user.id} was successfully verified`,
            });

            res.send({ data: user });
          }
        });
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
  userLoginValidation,
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
