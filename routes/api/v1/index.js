const express = require('express');

const router = express.Router();
const fs = require('fs');

/*
GET /api/v1/users Получаем всех юзеров
POST /api/v1/users Добавляем нового юзера
GET /api/v1/users/:id Получаем юзера по айди
PUT /api/v1/users/:id Обновляем юзера по айди
DELETE /api/v1/users/:id Удаляем юзера по айди
*/

// @route   GET api/v1/blog
// @desc    Get all blog records
router.get('/blog', (req, res) => {
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
router.get('/blog/:id', (req, res) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const recordById = blog.find(
      (record) => record.id === Number(req.params.id),
    );
    res.json({
      data: recordById,
    });
  });
});

// @route   POST api/v1/blog
// @desc    Add new record to blog
router.post('/blog', (req, res) => {
  fs.readFile('data/blog.json', 'utf8', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const newId = Math.max(...blog.map((record) => record.id)) + 1;
    const newUser = {
      id: newId,
      ...req.body,
    };
    blog.push(newUser);
    fs.writeFile('data/blog.json', JSON.stringify(blog, null, 2), (error) => {
      if (error) throw error;
      res.json({ data: newUser });
    });
  });
});

// @route   PUT api/v1/blog/:id
// @desc    Update a record by its ID
router.put('/blog/:id', (req, res) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const recordById = blog.find((rec) => rec.id === Number(req.params.id));
    const updatedRecord = {
      ...recordById,
      ...req.body,
    };
    const updatedBlog = blog.map(
      (rec) => rec.id === Number(req.params.id ? updatedRecord : rec),
    );
    fs.writeFile(
      'data/blog.json',
      JSON.stringify(updatedBlog, null, 2),
      (error) => {
        if (error) throw error;
        res.json({ data: recordById });
      },
    );
  });
});

// @route   DELETE api/v1/blog/:id
// @desc    Delete a record by its ID
router.delete('/blog/:id', (req, res) => {
  fs.readFile('data/blog.json', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const updatedBlog = blog.filter((rec) => rec.id !== Number(req.params.id));
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

// @route   GET api/v1/users
// @desc    Get all users
router.get('/users', (req, res) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    res.json({
      data: users,
    });
  });
});

module.exports = router;
