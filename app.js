const express = require('express');
const app = express();
require('dotenv').config();
const { PORT } = process.env;
const v1Router = require('./routes');

app.use(express.json());
app.use('/api/v1/', v1Router);

app.use('/', (req, res) => {
  res.status(404).json({ status: false, message: 'Not Found!' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ status: false, message: 'Internal Server Error!', data: err.message });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
