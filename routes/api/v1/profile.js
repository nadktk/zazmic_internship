const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');

const root = path.dirname(process.mainModule.filename);
const { infoLogger } = require(path.join(root, 'logger', 'logger.js'));
const { isLoggedIn } = require(path.join(root, 'passport'));
const { User } = require(path.join(root, 'models', 'sequelize'));
const { ArticlesView } = require(path.join(root, 'models', 'mongoose'));

const { userUpdateIsValid } = require(path.join(
  root,
  'utils',
  'validation.js',
));
const { USERID_ERR, USERDATA_ERR } = require(path.join(
  root,
  'utils',
  'error-messages',
));

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

    // MySQL operations: find user and update
    const [updatedRows] = await User.update(req.body, {
      where: { id },
      individualHooks: true,
    });
    if (!updatedRows) throw new Error(USERID_ERR);
    const updatedUser = await User.findByPk(id);

    // logging success
    infoLogger.log({
      level: 'info',
      message: `User ${id} was successfully updated`,
    });

    res.json({ data: updatedUser });
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

    // MySQL operations: delete user record
    const destroyedRows = await User.destroy({ where: { id } });
    if (!destroyedRows) throw new Error(USERID_ERR);

    // MongoDB operations: delete docs from articlesviews collection
    await ArticlesView.deleteMany({
      authorId: id,
    });

    // logging success
    infoLogger.log({
      level: 'info',
      message: `User ${id} was successfully deleted`,
    });

    req.logout();
    req.session.destroy((err) => {
      if (err) next(err);
      else {
        res.clearCookie('sid');
        res.send();
      }
    });
  }),
);

module.exports = router;
