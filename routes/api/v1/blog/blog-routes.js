const fs = require('fs');
const express = require('express');

const router = express.Router();

// @route   GET api/v1/blog
// @desc    Get all blog records
router.get('/', (req, res) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    res.json({
      data: blog,
    });
  });
});

// @route   GET api/v1/blog/:id
// @desc    Get a record by its ID
router.get('/:id', (req, res) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const recordById = blog.find((record) => record.id === +req.params.id);
    if (!recordById) throw new Error('Wrong record id');
    res.json({
      data: recordById,
    });
  });
});

// @route   POST api/v1/blog
// @desc    Add new record to blog
router.post('/', (req, res) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const newId = blog.length
      ? Math.max(...blog.map((record) => record.id)) + 1
      : 1;
    const newRecord = {
      id: newId,
      ...req.body,
    };
    blog.push(newRecord);
    fs.writeFile('data/blog.json', JSON.stringify(blog, null, 2), (error) => {
      if (error) throw error;
      res.json({ data: newRecord });
    });
  });
});

// @route   PUT api/v1/blog/:id
// @desc    Update a record by its ID
router.put('/:id', (req, res) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const recordById = blog.find((rec) => rec.id === +req.params.id);
    const updatedRecord = {
      ...recordById,
      ...req.body,
    };
    const updatedBlog = blog.map((rec) => (rec.id === +req.params.id ? updatedRecord : rec));
    fs.writeFile(
      'data/blog.json',
      JSON.stringify(updatedBlog, null, 2),
      (error) => {
        if (error) throw error;
        res.json({ data: updatedRecord });
      },
    );
  });
});

// @route   DELETE api/v1/blog/:id
// @desc    Delete a record by its ID
router.delete('/:id', (req, res) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const updatedBlog = blog.filter((rec) => rec.id !== +req.params.id);
    fs.writeFile(
      'data/blog.json',
      JSON.stringify(updatedBlog, null, 2),
      (error) => {
        if (error) throw error;
        res.json({ data: updatedBlog });
      },
    );
  });
});

module.exports = router;
