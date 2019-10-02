const express = require('express');
const router = express.Router();
const fs = require('fs');

/*
Роуты
GET /api/v1/blog Получаем все записи в блоге - DONE
POST /api/v1/blog Добавляем новую запись - DONE
GET /api/v1/blog/:id Получаем запись по айди - DONE
PUT /api/v1/blog/:id Обновляем запись по айди
DELETE /api/v1/blog/:id Удаляем запись по айди
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
// @desc    add new record to blog
router.post('/blog', (req, res) => {
  fs.readFile('data/blog.json', 'utf8', (err, data) => {
    if (err) throw err;
    const blog = JSON.parse(data);
    const maxId = Math.max(...blog.map((record) => record.id));
    blog.push({
      id: maxId + 1,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      publishedAt: req.body.publishedAt,
    });
    fs.writeFile('data/blog.json', JSON.stringify(blog, null, 2), (err) => {
      if (err) throw err;
      res.json({
        message: 'OK',
      });
    });
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
