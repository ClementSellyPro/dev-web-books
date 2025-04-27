const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const router = express.Router();
const booksCtrl = require('../controllers/books');

router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/bestrating', booksCtrl.getBestRating);
router.post('/:id/rating', auth, booksCtrl.rateOneBook);
router.post('/', auth, multer, booksCtrl.createBook);
router.put('/:id', auth, multer, booksCtrl.modifyOneBook);
router.delete('/:id', auth, booksCtrl.deleteOneBook);

module.exports = router;