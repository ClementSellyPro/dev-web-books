const express = require('express');
const mongoose = require("mongoose");

const path = require('path');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://root:route@cluster0.udlgfso.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;