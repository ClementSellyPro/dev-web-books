const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const router = express.Router();
const booksCtrl = require('../controllers/books');

router.post('/', auth, multer, booksCtrl.createBook);

module.exports = router;