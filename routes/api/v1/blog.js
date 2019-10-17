const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');

const root = path.dirname(process.mainModule.filename);
const { recordIsValid } = require(path.join(root, 'utils', 'validation.js'));
const { User, Article } = require(path.join(root, 'models'));
const ArticlesView = require(path.join(root, 'models', 'ArticlesView'));
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
    // MySQL operations: find all articles
    let articles = await Article.findAll({
      include: [{ model: User, as: 'author' }],
      order: [['id', 'DESC']],
      raw: true,
      nest: true,
    });

    // MongoDB operations: add views to all articles
    const allViews = await ArticlesView.find();
    articles = articles.map((article) => {
      const av = allViews.find((doc) => +doc.articleId === article.id);
      const views = av ? av.views : 0;
      return { ...article, views };
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

    // MySQL operations: find article by id
    const articleById = await Article.findByPk(id, {
      include: [{ model: User, as: 'author' }],
      raw: true,
      nest: true,
    });

    if (!articleById) {
      res.status(404);
      throw new Error(BLOGID_ERR);
    }

    // MongoDB operations: find article views doc and increment views count
    const viewsDoc = await ArticlesView.findOne({ articleId: id });
    const nextViews = viewsDoc ? viewsDoc.views + 1 : 1;
    if (!viewsDoc) {
      await ArticlesView.create({
        articleId: id,
        authorId: articleById.authorId,
        views: nextViews,
      });
    } else {
      await ArticlesView.updateOne({ articleId: id }, { views: nextViews });
    }

    articleById.views = nextViews;
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
    if (!recordIsValid(req.body)) throw new Error(BLOGDATA_ERR);
    const { id } = req.params;

    // MySQL operations: find article by id
    const article = await Article.findByPk(id);
    if (!article) throw new Error(BLOGID_ERR);
    await article.update(req.body);

    // MongoDB operations: update document if authorID changes
    if (+req.body.authorId !== article.authorId) {
      await ArticlesView.updateOne(
        { articleId: id },
        { authorId: article.authorId },
      );
    }

    res.json({ data: article });
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

    // MySQL operations: create new article
    const newArticle = await Article.create(req.body);

    // MongoDB operations: add doc to article views collection
    await ArticlesView.create({
      articleId: newArticle.id,
      authorId: newArticle.authorId,
      views: 0,
    });

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

    // MySQL operations: delete article record
    const destroyedRows = await Article.destroy({ where: { id } });
    if (!destroyedRows) throw new Error(BLOGID_ERR);

    // MongoDB operations: delete doc from articlesviews collection
    await ArticlesView.deleteOne({
      articleId: id,
    });

    res.send();
  }),
);

module.exports = router;
