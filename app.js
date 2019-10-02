const express = require('express');
const https = require('https');

const routes = require('./routes/api/v1');

const app = express();

app.use('/api/v1', routes);
app.get('*', (req, res) => {
  https.get(process.env.FRONTEND_URL, (response) => response.pipe(res));
});

const port = process.env.PORT || 2632;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Server is running on port ${port}`));
