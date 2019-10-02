const express = require('express');
const router = express.Router();

/*
Роуты
GET /api/v1/blog Получаем все записи в блоге
POST /api/v1/blog Добавляем новую запись
GET /api/v1/blog/:id Получаем запись по айди
PUT /api/v1/blog/:id Обновляем запись по айди
DELETE /api/v1/blog/:id Удаляем запись по айди

Пример объекта записи в блоге
{
    id: 1,
    title: "",
    content: "",
    author: "",
    publishedAt: ""
}

GET /api/v1/users Получаем всех юзеров 
POST /api/v1/users Добавляем нового юзера
GET /api/v1/users/:id Получаем юзера по айди
PUT /api/v1/users/:id Обновляем юзера по айди
DELETE /api/v1/users/:id Удаляем юзера по айди

Пример объекта юзера
{
    id: 1,
    email: "",
    firstName: "",
    lastName: ""
}
*/

// GET blog
// @route   GET api/v1/blog
// @desc    Get all blog records
router.get('/blog', (req, res) => {
  res.json({
    data: [
      {
        id: 1,
        title: 'title',
        content: 'content',
        author: 'author',
        publishedAt: 'published',
      },
      {
        id: 2,
        title: 'title',
        content: 'content',
        author: 'author',
        publishedAt: 'published',
      },
    ],
  });
});

// GET users
// @route   GET api/v1/users
// @desc    Get all users
router.get('/users', (req, res) => {
  res.json({
    data: [
      {
        id: 1,
        email: 'email',
        firstName: 'firstname',
        lastName: 'lastname',
      },
      {
        id: 2,
        email: 'email',
        firstName: 'firstname',
        lastName: 'lastname',
      },
    ],
  });
});

module.exports = router;
