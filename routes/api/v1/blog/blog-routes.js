const express = require('express');
const { recordIsValid } = require('../../../../utils/validation');
const {
  CONNECT_ERR,
  BLOGID_ERR,
  BLOGDATA_ERR,
} = require('../../../../utils/error-messages');

const router = express.Router();

const { Article, User } = require('../../../../models');

/**
 * @route   GET api/v1/blog
 * @desc    Get all blog records
 */

router.get('/', async (req, res, next) => {
  const articles = await Article.findAll({
    order: [['id', 'DESC']],
    include: [{ model: User, as: 'author' }],
  }).catch(() => next(new Error(CONNECT_ERR)));
  return res.json({ data: articles });
});

/**
 * @route   GET api/v1/blog/:id
 * @desc    Get a record by its ID
 */

router.get('/:id', async (req, res, next) => {
  const articleById = await Article.findByPk(req.params.id, {
    include: [{ model: User, as: 'author' }],
  }).catch(() => next(new Error(CONNECT_ERR)));
  if (articleById) {
    res.json({ data: articleById });
  } else {
    res.status(404);
    next(new Error(BLOGID_ERR));
  }
});

/**
 * @route   PUT api/v1/blog/:id
 * @desc    Update a record by its ID
 */

router.put('/:id', async (req, res, next) => {
  if (recordIsValid(req.body)) {
    await Article.update(req.body, {
      where: { id: req.params.id },
    }).catch(() => next(new Error(CONNECT_ERR)));
    res.json({ data: req.body });
  }
  next(new Error(BLOGDATA_ERR));
});

/**
 * @route   POST api/v1/blog
 * @desc    Add new record to blog
 */

router.post('/', async (req, res, next) => {
  if (recordIsValid(req.body)) {
    const newArticle = await Article.create(req.body).catch(() => next(new Error(CONNECT_ERR)));
    res.json({ data: newArticle });
  } else next(new Error(BLOGDATA_ERR));
});

/**
 * @route   DELETE api/v1/blog/:id
 * @desc    Delete a record by its ID
 */

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  await Article.destroy({ where: { id } }).catch(() => next(new Error(CONNECT_ERR)));
  res.send();
});

module.exports = router;
