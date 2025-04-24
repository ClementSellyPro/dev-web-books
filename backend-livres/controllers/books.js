const Book = require('../models/Book');

exports.createBook = (req, res, next) => {
  console.log("This is the req.body.book ::: ", req.body.book);
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userID;

  console.log("This is the req.body.book after delete id ::: ", bookObject);

  const book = new Book({
    ...bookObject,
    userID: req.auth.userID,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  delete book._id;
  console.log("This is the book::: ", book)
  book.save()
  .then(() => res.status(201).json({ message: "Livre correctement ajouté" }))
  .catch(error => res.status(400).json({ error: "Erreur ::: ", error }))
}