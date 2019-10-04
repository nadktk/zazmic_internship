const express = require('express');
const { userIsValid } = require('../../../../utils/validation');
const DB = require('../../../../utils/db');
const {
  CONNECT_ERR,
  USERID_ERR,
  USERDATA_ERR,
} = require('../../../../utils/error-messages');

const router = express.Router();
const usersDB = new DB('data/users.json');

/**
@route   GET api/v1/users
@desc    Get all users
*/

router.get('/', async (req, res, next) => {
  const users = await usersDB
    .findAll()
    .catch(() => next(new Error(CONNECT_ERR)));
  if (users) res.json({ data: users });
});

/**
@route   GET /api/v1/users/:id
@desc    Get a user by id
*/

router.get('/:id', async (req, res, next) => {
  const userById = await usersDB
    .find(req.params.id)
    .catch(() => next(new Error(CONNECT_ERR)));
  if (!userById) next(new Error(USERID_ERR));
  else res.json({ data: userById });
});

/**
@route   PUT api/v1/users/:id
@desc    Update a user by ID
*/

router.put('/:id', async (req, res, next) => {
  if (userIsValid(req.body)) {
    const newUsers = await usersDB
      .update(req.params.id, req.body)
      .catch(() => next(new Error(CONNECT_ERR)));
    if (newUsers) res.json({ data: newUsers });
  } else next(new Error(USERDATA_ERR));
});

/**
@route   POST api/v1/users
@desc    Add new user
*/

router.post('/', async (req, res, next) => {
  if (userIsValid(req.body)) {
    const newUsers = await usersDB
      .create(req.body)
      .catch(() => next(new Error(CONNECT_ERR)));
    if (newUsers) res.json({ data: newUsers });
  } else next(new Error(USERDATA_ERR));
});

/**
@route   DELETE api/v1/users/:id
@desc    Delete a user by ID
*/

router.delete('/:id', async (req, res, next) => {
  const deletedUser = await usersDB
    .delete(req.params.id)
    .catch(() => next(new Error(CONNECT_ERR)));
  if (!deletedUser) next(new Error(USERID_ERR));
  else res.json({ data: deletedUser });
});

module.exports = router;
