const express = require('express');

const router = express.Router();
const fs = require('fs');

/*
GET /api/v1/users Получаем всех юзеров - DONE
POST /api/v1/users Добавляем нового юзера
GET /api/v1/users/:id Получаем юзера по айди
PUT /api/v1/users/:id Обновляем юзера по айди
DELETE /api/v1/users/:id Удаляем юзера по айди
*/

// @route   GET api/v1/users
// @desc    Get all users
router.get('/', (req, res) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    res.json({
      data: users,
    });
  });
});

// @route   POST api/v1/users
// @desc    Add new user
router.post('/', (req, res) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    const newId = users.length
      ? Math.max(...users.map((user) => user.id)) + 1
      : 1;
    const newUser = {
      id: newId,
      ...req.body,
    };
    users.push(newUser);
    fs.writeFile('data/users.json', JSON.stringify(users, null, 2), (error) => {
      if (error) throw error;
      res.json({ data: newUser });
    });
  });
});

module.exports = router;
