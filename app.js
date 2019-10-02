const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

const routes = require('./routes/api/v1');

const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/v1', routes);
app.get('*', (req, res) => {
  https.get(process.env.FRONTEND_URL, (response) => response.pipe(res));
});

const port = process.env.PORT || 2632;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Server is running on port ${port}`));
