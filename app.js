const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('Hello from Server!'));

const port = process.env.PORT || 3000;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Server is running on port ${port}`));
