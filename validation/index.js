const { body, validationResult } = require('express-validator');

const validation = (rules) => {
  const middlewares = [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) next();
      else res.status(422).json({ errors: errors.array() });
    },
  ];
  return middlewares;
};

const firstNameVal = body('firstName')
  .exists({ checkFalsy: true })
  .withMessage('First name is required');

const lastNameVal = body('lastName')
  .exists({ checkFalsy: true })
  .withMessage('Last name is required');

const emailVal = body('email')
  .exists({ checkFalsy: true })
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Should be an email');

const passwordVal = body('password')
  .exists({ checkFalsy: true })
  .withMessage('Passwsord is required')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 chars long');

const titleVal = body('title')
  .exists({ checkFalsy: true })
  .withMessage('Title is required');

const contentVal = body('content')
  .exists({ checkFalsy: true })
  .withMessage('Content is required');

const publishedAtVal = body('publishedAt')
  .toDate()
  .exists({ checkFalsy: true })
  .withMessage('PublishedAt is required');

exports.userCreateValidation = validation([
  firstNameVal,
  lastNameVal,
  emailVal,
  passwordVal,
]);

exports.userLoginValidation = validation([emailVal, passwordVal]);

exports.editProfileValidation = validation([firstNameVal, lastNameVal]);

exports.articleValidation = validation([titleVal, contentVal, publishedAtVal]);

exports.commentValidation = validation([contentVal]);
