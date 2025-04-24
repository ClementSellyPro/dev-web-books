const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books');

router.post('/', booksCtrl.createBook);

module.exports = router;