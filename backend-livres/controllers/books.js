const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const Book = require('../models/Book');

exports.getAllBooks = (req, res, next) => {
  Book.find()
  .then(books => res.status(200).json(books))
  .catch(error => res.status(400).json({ error }));
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json({ error }));
}

exports.rateOneBook = async (req, res, next) => {
  try {
    const { userId, rating } = req.body;
    const bookId = req.params.id;

    if (!userId || rating == null) {
      return res.status(400).json({ error: 'userId et rating sont requis.' });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }

    const alreadyRated = book.ratings.some(r => r.userId === userId);
    if (alreadyRated) {
      return res.status(400).json({ error: 'Vous avez déjà noté ce livre.' });
    }

    book.ratings.push({ userId, grade: rating });
    const totalGrades = book.ratings.reduce((acc, r) => acc + r.grade, 0);
    book.averageRating = (totalGrades / book.ratings.length).toFixed(2);

    await book.save();
    res.status(201).json(book);

  } catch (error) {
    console.error('Erreur lors de la notation du livre:', error);
    res.status(400).json({ error: error.message || 'Erreur lors de la notation du livre.' });
  }
}

exports.getBestRating = async (req, res, next) => {
  try {
    const bestRatedBooks = await Book.find()
      .sort({ averageRating: -1 })
      .limit(3);

    res.status(200).json(bestRatedBooks);
  } catch (error) {
    console.error('Erreur pour récupérer les meilleurs livres:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.createBook = async (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
  
    const webpFilename = await processImage(req.file);
  
    const initialRatings = Array.isArray(bookObject.ratings)
      ? bookObject.ratings.filter(rating => rating.userId && rating.grade > 0)
          .map(rating => ({
          userId: rating.userId,
          grade: rating.grade >= 0 && rating.grade <= 5 ? rating.grade : 0 
        }))
      : [];

    const book = new Book({
      ...bookObject,
      userID: req.auth.userID,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${webpFilename}`,
      ratings: initialRatings
    });

    await book.save()
    .then(() => res.status(201).json({ message: "Livre correctement ajouté" }))
    .catch(error => res.status(400).json({ error: "Erreur ::: ", error }))
}

exports.modifyOneBook = async (req, res, next) => {
  try {
    const bookObject = req.file
      ? { ...JSON.parse(req.body.book) }
      : { ...req.body };

    let webpFilename;

    if (req.file) {
      const currentBook = await Book.findOne({ _id: req.params.id });

      if (!currentBook) {
        return res.status(404).json({ error: 'Livre non trouvé.' });
      }

      const oldImageFilename = currentBook.imageUrl.split('/images/')[1];
      const oldImagePath = path.join(__dirname, '../images', oldImageFilename);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'ancienne image:", error);
      }
    }

    webpFilename = await processImage(req.file);
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${webpFilename}`;

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id, userID: req.auth.userID }
    );

    res.status(200).json({ message: "Livre modifié" });

  } catch (error) {
    res.status(400).json({ error });
  }
}

exports.deleteOneBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    const filename = book.imageUrl.split('/images/')[1];
    const imagePath = path.join(__dirname, '../images', filename);

    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
    }

    await Book.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: 'Livre supprimé !' }); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
}


const processImage = async (file) => {
  const originalName = file.filename;
  const nameWithoutExt = path.parse(originalName).name;
  const webpFilename = `${nameWithoutExt}_${Date.now()}.webp`;
  const imagePath = path.join(__dirname, '../images', webpFilename);

  await sharp(file.path)
    .webp({ quality: 20 })
    .toFile(imagePath);

  fs.unlink(file.path, (error) => {
    if (error) console.error("Failed to delete original image:", error);
  });

  return webpFilename;
};