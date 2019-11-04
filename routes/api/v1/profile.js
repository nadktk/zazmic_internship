const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');

const root = path.dirname(process.mainModule.filename);
const authService = require(path.join(root, 'services', 'auth-service.js'));
const { isLoggedIn } = require(path.join(root, 'passport'));
const { userUpdateIsValid } = require(path.join(
  root,
  'utils',
  'validation.js',
));

// multer & GCS
const multer = require('multer');

const gcStorage = require(path.join(root, 'gcs', 'multer-gcs.js'));
const { deleteFile } = require(path.join(root, 'services', 'gcs-service'));

const storage = gcStorage({
  prefix: 'nadiia/avatars',
  size: {
    width: 180,
    height: 180,
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000 * 1000 * 5,
  },
});

// models
const { Article } = require(path.join(root, 'models', 'sequelize'));
const { ArticlesView } = require(path.join(root, 'models', 'mongoose'));

// logger
const { infoLogger } = require(path.join(root, 'logger', 'logger.js'));

// errors messages
const { USERDATA_ERR } = require(path.join(root, 'utils', 'error-messages'));

const router = express.Router();

/**
 * @route   PUT api/v1/profile
 * @desc    Update user profile: change first name or last name
 */

router.put(
  '/',
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    if (!userUpdateIsValid(req.body)) throw new Error(USERDATA_ERR);
    const { id } = req.user;
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };

    // MySQL operations: find user and update
    const updated = await req.user.update(userData);

    // logging success
    infoLogger.log({
      level: 'info',
      message: `User ${id} was successfully updated`,
    });

    res.json({ data: req.user });
  }),
);

/**
 * @route   DELETE api/v1/profile
 * @desc    Delete user
 */

router.delete(
  '/',
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const { id } = req.user;

    const oldProfilePicture = req.user.picture;

    // find all articles pictures to delete them
    let articlesPictures = await Article.findAll({
      where: {
        authorId: id,
        picture: {
          [Op.not]: null,
        },
      },
      raw: true,
      attributes: ['picture'],
    });
    articlesPictures = articlesPictures.map((i) => i.picture);

    // MySQL operations: delete user record
    const destroyed = await req.user.destroy();

    // delete profile picture
    if (oldProfilePicture) {
      await deleteFile(oldProfilePicture);
    }

    // delete articles pictures
    if (articlesPictures.length) {
      await Promise.all(articlesPictures.map((url) => deleteFile(url)));
    }

    // MongoDB operations: delete docs from articlesviews collection
    await ArticlesView.deleteMany({
      authorId: id,
    });

    // logging success
    infoLogger.log({
      level: 'info',
      message: `User ${id} was successfully deleted`,
    });

    await authService.logout(req, res, next);
  }),
);

/**
 * @route   PUT api/v1/profile/picture
 * @desc    Put user profile picture
 */

router.put(
  '/picture',
  isLoggedIn,
  upload.single('picture'),
  asyncHandler(async (req, res, next) => {
    const { id } = req.user;

    const userData = {
      picture: req.file.url,
    };

    const oldPicture = req.user.picture;

    // MySQL operations: update user
    await req.user.update(userData);

    // logging success
    infoLogger.log({
      level: 'info',
      message: `User's ${id} picture was successfully updated`,
    });

    // delete old profile picture
    if (oldPicture) {
      await deleteFile(oldPicture);
    }

    res.json({ data: req.user });
  }),
);

module.exports = router;
