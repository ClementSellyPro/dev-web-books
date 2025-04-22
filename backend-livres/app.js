const express = require('express');

const app = express();

app.use((req, res) => {
  res.json({message: 'Voila voila'})
});


module.exports = app;