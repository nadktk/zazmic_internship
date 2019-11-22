// eslint-disable-next-line
db.getSiblingDB('database').createUser(
  {
    user: 'user',
    pwd: 'password',
    roles: [
      {
        role: 'readWrite',
        db: 'database',
      },
    ],
  },
);
