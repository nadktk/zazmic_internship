const express = require('express');
const passport = require('passport');

const router = express.Router();

/**
 * @route   GET api/v1/oauth/google
 * @desc    Starts google authentication
 */

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

/**
 * @route   POST /api/v1/oauth/google/callback
 * @desc    Sends userdata after successful google authentication
 */

router.post(
  '/google/callback',
  passport.authenticate('google'),
  (req, res, next) => {
    res.json({
      data: req.user,
    });
  },
);

/**
 * @route   GET api/v1/oauth/facebook
 * @desc    Starts facebook authentication
 */

router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
  }),
);

/**
 * @route   POST /api/v1/oauth/facebook/callback
 * @desc    Sends userdata after successful facebook authentication
 */

router.post(
  '/facebook/callback',
  passport.authenticate('facebook'),
  (req, res, next) => {
    res.json({
      data: req.user,
    });
  },
);

module.exports = router;
