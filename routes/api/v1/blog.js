const express = require('express');
const path = require('path');
const multer = require('multer');
const asyncHandler = require('express-async-handler');

const root = path.dirname(process.mainModule.filename);
const { isLoggedIn } = require(path.join(root, 'passport'));
const { articleValidation } = require(path.join(root, 'validation'));
const addPaginationOpts = require(path.join(
  root,
  'utils',
  'add-pagination-opts',
));

// multer & GCS
const multerGCStorage = require(path.join(root, 'gcs', 'multer-gcs.js'));
const { deleteFile } = require(path.join(root, 'services', 'gcs-service.js'));

const storage = multerGCStorage({
  prefix: 'nadiia/articles',
  size: {
    width: 1200,
    height: 630,
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000 * 1000 * 5,
  },
});

// models
const { User, Article } = require(path.join(root, 'models', 'sequelize'));
const { ArticlesView } = require(path.join(root, 'models', 'mongoose'));

// loggers
const { infoLogger, historyLogger } = require(path.join(
  root,
  'logger',
  'logger.js',
));

// errors messages
const { BLOGID_ERR, PERMISSION_ERR } = require(path.join(
  root,
  'utils',
  'error-messages',
));

// extract Article data from request
const extractData = (req) => ({
  title: req.body.title,
  content: req.body.content,
  publishedAt: req.body.publishedAt,
  authorId: req.user.id,
});

const router = express.Router();

/**
 * @route   GET api/v1/blog
 * @desc    Get all blog records
 */

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const { after } = req.query;

    // define query options
    const opts = {
      include: [{ model: User, as: 'author' }],
      order: [['publishedAt', 'DESC'], ['id', 'DESC']],
      limit: 5,
      raw: true,
      nest: true,
    };

    if (after) addPaginationOpts(opts, after);

    // MySQL operations: find all articles
    let articles = await Article.findAll(opts);

    // MongoDB operations: add views to all articles
    const allViews = await ArticlesView.find();

    articles = articles.map((article) => {
      const av = allViews.find((doc) => doc.articleId === article.id);
      const views = av ? av.views : 0;
      return { ...article, views };
    });

    // send response
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
    const id = Number(req.params.id);

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
    const viewsDoc = await ArticlesView.findOneAndUpdate(
      { articleId: id },
      {
        $set: {
          authorId: articleById.authorId,
        },
        $inc: {
          views: 1,
        },
      },
      { upsert: true },
    );

    // logging article history
    historyLogger.log({
      level: 'info',
      message: `Article ${id} was viewed`,
      metadata: {
        articleId: id,
        authorId: articleById.authorId,
      },
    });

    articleById.views = viewsDoc ? viewsDoc.views + 1 : 1;
    res.json({ data: articleById });
  }),
);

/**
 * @route   PUT api/v1/blog/:id
 * @desc    Update a record by its ID
 */

router.put(
  '/:id',
  isLoggedIn,
  upload.single('picture'),
  articleValidation,
  asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);

    // extract article data from request
    const newArticleData = extractData(req);
    if (req.file) newArticleData.picture = req.file.url;

    // MySQL operations: find article by id and update it
    const article = await Article.findByPk(id);
    if (!article) throw new Error(BLOGID_ERR);

    const oldArticlePicture = article.picture;

    // check permissions
    if (article.authorId !== req.user.id) throw new Error(PERMISSION_ERR);
    await article.update(newArticleData);

    // delete old article picture
    if (oldArticlePicture && oldArticlePicture !== article.picture) {
      await deleteFile(oldArticlePicture);
    }

    // logging success
    infoLogger.log({
      level: 'info',
      message: `Article ${id} was successfully updated`,
    });

    // send response
    res.json({ data: article });
  }),
);

/**
 * @route   POST api/v1/blog
 * @desc    Add new record to blog
 */

router.post(
  '/',
  isLoggedIn,
  upload.single('picture'),
  articleValidation,
  asyncHandler(async (req, res, next) => {
    // extract article data from request
    const newArticleData = extractData(req);
    newArticleData.picture = req.file ? req.file.url : null;

    // MySQL operations: create new article
    const newArticle = await Article.create(newArticleData);

    // MongoDB operations: add doc to article views collection
    await ArticlesView.create({
      articleId: newArticle.id,
      authorId: newArticle.authorId,
      views: 0,
    });

    // logging success
    infoLogger.log({
      level: 'info',
      message: `Article ${newArticle.id} was successfully created`,
    });

    // send response
    res.json({ data: newArticle });
  }),
);

/**
 * @route   DELETE api/v1/blog/:id
 * @desc    Delete a record by its ID
 */

router.delete(
  '/:id',
  isLoggedIn,
  asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);

    // MySQL operations: delete article record
    const articleToDestroy = await Article.findByPk(id);
    if (!articleToDestroy) throw new Error(BLOGID_ERR);

    // check permissions
    if (articleToDestroy.authorId !== req.user.id) {
      throw new Error(PERMISSION_ERR);
    }

    const articlePicture = articleToDestroy.picture;
    await articleToDestroy.destroy();

    // delete article picture
    if (articlePicture) {
      await deleteFile(articlePicture);
    }

    // MongoDB operations: delete doc from articlesviews collection
    await ArticlesView.deleteOne({
      articleId: id,
    });

    // logging success
    infoLogger.log({
      level: 'info',
      message: `Article ${id} was successfully deleted`,
    });

    // send response
    res.send();
  }),
);

module.exports = router;
