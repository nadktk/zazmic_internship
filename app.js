const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

// import routers
const blogRoutes = require('./routes/api/v1/blog/blog-routes');
const usersRoutes = require('./routes/api/v1/users/users-routes');

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
/* eslint-disable-next-line no-unused-vars */
app.use((err, req, res, next) => {
  res.status(500);
  res.send({
    error: err.message,
  });
});

const port = process.env.PORT || 2632;
/* eslint-disable-next-line no-console */
app.listen(port, () => console.log(`Server is running on port ${port}`));
