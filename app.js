/* eslint-disable no-console */
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

// import sequelize instance
const db = require(path.join(__dirname, 'utils', 'database.js'));

// import routers
const blogRoutes = require(path.join(__dirname, 'routes', 'api', 'v1', 'blog'));
const usersRoutes = require(path.join(
  __dirname,
  'routes',
  'api',
  'v1',
  'users',
));

const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use routers
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/users', usersRoutes);
app.get('*', (req, res) => {
  https.get(process.env.FRONTEND_URL, (response) => response.pipe(res));
});

// errors handling
app.use((err, req, res, next) => {
  if (res.statusCode === 200) res.status(500);
  res.send({
    error: err.message,
  });
});

// databases
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    replicaSet: 'mentorship-shard-0',
  })
  .then(() => {
    const port = process.env.PORT || 2632;
    db.authenticate()
      .then(() => {
        console.log('Connected to both databases');
        app.listen(port, () => console.log(`Server is running on port ${port}`));
      })
      .catch((err) => {
        console.error('Unable to connect to MySQL database:', err);
      });
  })
  .catch((error) => {
    console.error('Unable to connect to MongoDB database:', error);
  });
