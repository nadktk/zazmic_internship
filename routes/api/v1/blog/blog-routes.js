const express = require('express');
const { recordIsValid } = require('../../../../utils/validation');
const DB = require('../../../../utils/db');
const {
  CONNECT_ERR,
  BLOGID_ERR,
  BLOGDATA_ERR,
} = require('../../../../utils/error-messages');

const router = express.Router();
const blogDB = new DB('data/blog.json');

/**
@route   GET api/v1/blog
@desc    Get all blog records
*/

router.get('/', async (req, res, next) => {
  const blog = await blogDB.findAll().catch(() => next(new Error(CONNECT_ERR)));
  if (blog) res.json({ data: blog });
});

/**
@route   GET api/v1/blog/:id
@desc    Get a record by its ID
*/

router.get('/:id', async (req, res, next) => {
  const recordById = await blogDB
    .find(req.params.id)
    .catch(() => next(new Error(CONNECT_ERR)));
  if (!recordById) next(new Error(BLOGID_ERR));
  else res.json({ data: recordById });
});

/**
@route   PUT api/v1/blog/:id
@desc    Update a record by its ID
*/

router.put('/:id', async (req, res, next) => {
  if (recordIsValid(req.body)) {
    const newBlog = await blogDB
      .update(req.params.id, req.body)
      .catch(() => next(new Error(CONNECT_ERR)));
    if (newBlog) res.json({ data: newBlog });
  } else next(new Error(BLOGDATA_ERR));
});

/**
@route   POST api/v1/blog
@desc    Add new record to blog
*/

router.post('/', async (req, res, next) => {
  if (recordIsValid(req.body)) {
    const newBlog = await blogDB
      .create(req.body)
      .catch(() => next(new Error(CONNECT_ERR)));
    if (newBlog) res.json({ data: newBlog });
  } else next(new Error(BLOGDATA_ERR));
});

/**
@route   DELETE api/v1/blog/:id
@desc    Delete a record by its ID
*/

router.delete('/:id', async (req, res, next) => {
  const deletedRecord = await blogDB
    .delete(req.params.id)
    .catch(() => next(new Error(CONNECT_ERR)));
  if (!deletedRecord) next(new Error(BLOGID_ERR));
  else res.json({ data: deletedRecord });
});

module.exports = router;
