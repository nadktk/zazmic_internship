const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');

const root = path.dirname(process.mainModule.filename);
const { isLoggedIn } = require(path.join(root, 'passport'));

// models
const { User, Comment } = require(path.join(root, 'models', 'sequelize'));

// loggers
const { infoLogger } = require(path.join(root, 'logger', 'logger.js'));

const { commentValidation } = require(path.join(root, 'validation'));

// errors messages
const { COMMENTID_ERR, PERMISSION_ERR } = require(path.join(
  root,
  'utils',
  'error-messages',
));

const router = express.Router();

/**
 * @route   GET api/v1/blog/:articleId/comments
 * @desc    Get article's comments by artcile ID
 */

router.get(
  '/:articleId/comments',
  asyncHandler(async (req, res, next) => {
    const articleId = Number(req.params.articleId);
    const after = Number(req.query.after);

    // define query options
    const opts = {
      where: {
        articleId,
      },
      order: [['id', 'DESC']],
      limit: 5,
      include: [{ model: User, as: 'author' }],
    };
    if (after) opts.where.id = { [Op.lt]: after };

    // MySQL operations: find comments by article id
    const commentsByArticleId = await Comment.findAll(opts);

    // send response
    res.json({ data: commentsByArticleId });
  }),
);

/**
 * @route   POST api/v1/blog/:articleId/comments
 * @desc    Create a new comment to article
 */

router.post(
  '/:articleId/comments',
  commentValidation,
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const articleId = Number(req.params.articleId);

    // extract comment data from request
    const newComData = {
      content: req.body.content,
      authorId: req.user.id,
      articleId,
    };

    // MySQL operations: create new article
    let newComment = await Comment.create(newComData);

    // log success
    infoLogger.log({
      level: 'info',
      message: `Comment ${newComment.id} for article ${articleId} was successfully created`,
    });

    // add author object to response data
    newComment = newComment.get({ plain: true });
    newComment.author = req.user;

    // emit socketio event
    const { io } = req.app.locals;
    io.to(`room_${articleId}`).emit('comment', {
      action: 'create',
      data: { comment: newComment },
    });

    // send response
    res.json({ data: newComment });
  }),
);

/**
 * @route   DELETE api/v1/blog/:articleId/comments/:id
 * @desc    Delete a comment by its ID
 */

router.delete(
  '/:articleId/comments/:id',
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const articleId = Number(req.params.articleId);
    const id = Number(req.params.id);

    // MySQL operations: find and destroy the comment
    const commentToDestroy = await Comment.findByPk(id);
    if (!commentToDestroy) throw new Error(COMMENTID_ERR);

    // check permissions
    if (commentToDestroy.authorId !== req.user.id) {
      throw new Error(PERMISSION_ERR);
    }

    // emit socketio event
    const { io } = req.app.locals;
    io.to(`room_${articleId}`).emit('comment', {
      action: 'destroy',
      data: { comment: commentToDestroy },
    });
    await commentToDestroy.destroy();

    // log success
    infoLogger.log({
      level: 'info',
      message: `Comment ${id} for article ${articleId} was successfully deleted`,
    });

    // send response
    res.send();
  }),
);

module.exports = router;
