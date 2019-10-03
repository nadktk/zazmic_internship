const fs = require('fs');
const express = require('express');

const router = express.Router();

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

// @route   GET /api/v1/users/:id
// @desc    Get a user by id
router.get('/:id', (req, res) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    const userById = users.find((user) => user.id === +req.params.id);
    if (!userById) throw new Error('Wrong user id');
    res.json({
      data: userById,
    });
  });
});

// @route   PUT api/v1/users/:id
// @desc    Update a user by ID
router.put('/:id', (req, res) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    const userById = users.find((user) => user.id === +req.params.id);
    const updatedUser = {
      ...userById,
      ...req.body,
    };
    const updatedUsers = users.map((user) => (user.id === +req.params.id ? updatedUser : user));
    fs.writeFile(
      'data/users.json',
      JSON.stringify(updatedUsers, null, 2),
      (error) => {
        if (error) throw error;
        res.json({ data: updatedUser });
      },
    );
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

// @route   DELETE api/v1/users/:id
// @desc    Delete a user by ID
router.delete('/:id', (req, res) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    const updatedUsers = users.filter((user) => user.id !== +req.params.id);
    fs.writeFile(
      'data/users.json',
      JSON.stringify(updatedUsers, null, 2),
      (error) => {
        if (error) throw error;
        res.json({ data: updatedUsers });
      },
    );
  });
});

module.exports = router;
