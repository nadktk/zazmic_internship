const fs = require('fs');
const express = require('express');
const { userIsValid } = require('../../../../utils/validation');

const router = express.Router();

/**
@route   GET api/v1/users
@desc    Get all users
*/
router.get('/', (req, res, next) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) next(err);
    else {
      const users = JSON.parse(data);
      res.json({
        data: users,
      });
    }
  });
});

/**
@route   GET /api/v1/users/:id
@desc    Get a user by id
*/
router.get('/:id', (req, res, next) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) next(err);
    else {
      const users = JSON.parse(data);
      const userById = users.find((user) => user.id === +req.params.id);
      if (!userById) next(new Error('Wrong user id'));
      else {
        res.json({
          data: userById,
        });
      }
    }
  });
});

/**
@route   PUT api/v1/users/:id
@desc    Update a user by ID
*/
router.put('/:id', (req, res, next) => {
  if (userIsValid(req.body)) {
    fs.readFile('data/users.json', (err, data) => {
      if (err) next(err);
      else {
        const users = JSON.parse(data);
        const userById = users.find((user) => user.id === +req.params.id);
        if (!userById) next(new Error('Wrong user id'));
        else {
          const updUser = {
            ...userById,
            ...req.body,
          };
          /* eslint-disable-next-line arrow-body-style */
          const updUsers = users.map((user) => {
            return user.id === +req.params.id ? updUser : user;
          });
          fs.writeFile(
            'data/users.json',
            JSON.stringify(updUsers, null, 2),
            (error) => {
              if (error) next(error);
              else res.json({ data: updUser });
            },
          );
        }
      }
    });
  } else next(new Error('Wrong user data'));
});

/**
@route   POST api/v1/users
@desc    Add new user
*/
router.post('/', (req, res, next) => {
  if (userIsValid(req.body)) {
    fs.readFile('data/users.json', (err, data) => {
      if (err) next(err);
      else {
        const users = JSON.parse(data);
        const newId = users.length
          ? Math.max(...users.map((user) => user.id)) + 1
          : 1;
        const newUser = {
          id: newId,
          ...req.body,
        };
        users.push(newUser);
        fs.writeFile(
          'data/users.json',
          JSON.stringify(users, null, 2),
          (error) => {
            if (error) next(error);
            else res.json({ data: newUser });
          },
        );
      }
    });
  } else next(new Error('Wrong user data'));
});

/**
@route   DELETE api/v1/users/:id
@desc    Delete a user by ID
*/
router.delete('/:id', (req, res, next) => {
  fs.readFile('data/users.json', (err, data) => {
    if (err) next(err);
    else {
      const users = JSON.parse(data);
      const updatedUsers = users.filter((user) => user.id !== +req.params.id);
      fs.writeFile(
        'data/users.json',
        JSON.stringify(updatedUsers, null, 2),
        (error) => {
          if (error) next(error);
          else res.send();
        },
      );
    }
  });
});

module.exports = router;
