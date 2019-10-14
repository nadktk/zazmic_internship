const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');

const root = path.dirname(process.mainModule.filename);
const { recordIsValid } = require(path.join(root, 'utils', 'validation.js'));
const { User, Article } = require(path.join(root, 'models'));
const { BLOGID_ERR, BLOGDATA_ERR } = require(path.join(
  root,
  'utils',
  'error-messages',
));

const router = express.Router();

/**
 * @route   GET api/v1/blog
 * @desc    Get all blog records
 */

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const articles = await Article.findAll({
      order: [['id', 'DESC']],
      include: [{ model: User, as: 'author' }],
    });
    res.json({ data: articles });
  }),
);

/**
 * @route   GET api/v1/blog/:id
 * @desc    Get a record by its ID
 */

router.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const articleById = await Article.findByPk(id, {
      include: [{ model: User, as: 'author' }],
    });
    if (!articleById) {
      res.status(404);
      throw new Error(BLOGID_ERR);
    }
    res.json({ data: articleById });
  }),
);

/**
 * @route   PUT api/v1/blog/:id
 * @desc    Update a record by its ID
 */

router.put(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!recordIsValid(req.body)) throw new Error(BLOGDATA_ERR);
    const [affectedRows] = await Article.update(req.body, {
      where: { id },
    });
    if (!affectedRows) throw new Error(BLOGID_ERR);
    res.json({ data: req.body });
  }),
);

/**
 * @route   POST api/v1/blog
 * @desc    Add new record to blog
 */

router.post(
  '/',
  asyncHandler(async (req, res, next) => {
    if (!recordIsValid(req.body)) throw new Error(BLOGDATA_ERR);
    const newArticle = await Article.create(req.body);
    res.json({ data: newArticle });
  }),
);

/**
 * @route   DELETE api/v1/blog/:id
 * @desc    Delete a record by its ID
 */

router.delete(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const destroyedRows = await Article.destroy({ where: { id } });
    if (!destroyedRows) throw new Error(BLOGID_ERR);
    res.send();
  }),
);

module.exports = router;
