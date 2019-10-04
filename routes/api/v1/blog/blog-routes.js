const fs = require('fs');
const express = require('express');
const { recordIsValid } = require('../../../../utils/validation');

const router = express.Router();

/**
@route   GET api/v1/blog
@desc    Get all blog records
*/
router.get('/', (req, res, next) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) next(err);
    else {
      const blog = JSON.parse(data);
      res.json({
        data: blog,
      });
    }
  });
});

/**
@route   GET api/v1/blog/:id
@desc    Get a record by its ID
*/
router.get('/:id', (req, res, next) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) next(err);
    else {
      const blog = JSON.parse(data);
      const recordById = blog.find((record) => record.id === +req.params.id);
      if (!recordById) next(new Error('Wrong record id'));
      else {
        res.json({
          data: recordById,
        });
      }
    }
  });
});

/**
@route   POST api/v1/blog
@desc    Add new record to blog
*/
router.post('/', (req, res, next) => {
  if (recordIsValid(req.body)) {
    fs.readFile('data/blog.json', (err, data) => {
      if (err) next(err);
      else {
        const blog = JSON.parse(data);
        const newId = blog.length
          ? Math.max(...blog.map((record) => record.id)) + 1
          : 1;
        const newRecord = {
          id: newId,
          ...req.body,
        };
        blog.push(newRecord);
        fs.writeFile(
          'data/blog.json',
          JSON.stringify(blog, null, 2),
          (error) => {
            if (error) next(error);
            else res.json({ data: newRecord });
          },
        );
      }
    });
  } else next(new Error('Wrong record data'));
});

/**
@route   PUT api/v1/blog/:id
@desc    Update a record by its ID
*/
router.put('/:id', (req, res, next) => {
  if (recordIsValid(req.body)) {
    fs.readFile('data/blog.json', (err, data) => {
      if (err) next(err);
      else {
        const blog = JSON.parse(data);
        const recordById = blog.find((rec) => rec.id === +req.params.id);
        if (!recordById) next(new Error('Wrong record id'));
        else {
          const updatedRecord = {
            ...recordById,
            ...req.body,
          };
          /* eslint-disable-next-line arrow-body-style */
          const updatedBlog = blog.map((rec) => {
            return rec.id === +req.params.id ? updatedRecord : rec;
          });
          fs.writeFile(
            'data/blog.json',
            JSON.stringify(updatedBlog, null, 2),
            (error) => {
              if (error) next(error);
              else res.json({ data: updatedRecord });
            },
          );
        }
      }
    });
  } else next(new Error('Wrong record data'));
});

/**
@route   DELETE api/v1/blog/:id
@desc    Delete a record by its ID
*/
router.delete('/:id', (req, res, next) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) next(err);
    else {
      const blog = JSON.parse(data);
      const updatedBlog = blog.filter((rec) => rec.id !== +req.params.id);
      fs.writeFile(
        'data/blog.json',
        JSON.stringify(updatedBlog, null, 2),
        (error) => {
          if (error) next(error);
          else res.send();
        },
      );
    }
  });
});

module.exports = router;
