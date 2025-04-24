const Book = require('../models/Book');

exports.createBook = (req, res, next) => {
  delete req.body._id;
  const book = new Book({
    ...req.body
  });
  book.save()
  .then(() => res.status(201).json({ message: "Livre correctement ajouté" }))
}