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

exports.rateOneBook = (req, res, next) => {

}

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.createBook = async (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userID;
  
    const webpFilename = await processImage(req.file);
  
    const book = new Book({
      ...bookObject,
      userID: req.auth.userID,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${webpFilename}`
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

exports.deleteOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if(!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      const filename = book.imageUrl.split('/images/')[1];

      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
}


const processImage = async (reqFile) => {
  const originalName = reqFile.filename;
  const nameWithoutExt = path.parse(originalName).name;
  const webpFilename = `${nameWithoutExt}_${Date.now()}.webp`;
  const imagePath = path.join(__dirname, '../images', webpFilename);

  await sharp(reqFile.path)
    .webp({ quality: 20 })
    .toFile(imagePath);

  fs.unlink(reqFile.path, (err) => {
    if (err) console.error("Failed to delete original image:", err);
  });

  return webpFilename;
};


// const bookObject = req.file
//     ? { ...JSON.parse(req.body.book) }
//     : { ...req.body };

//   if(req.file) {
//     const webpFilename = await processImage(req.file);
//     bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${webpFilename}`;
//   }

//   const currentBook = await Book.findOne({ _id: req.params.id });

//   if(req.file) {
//     const oldImageName = currentBook.imageUrl.split('/images')[1];
//     const oldImagePath = path.joint(__dirname, '../images', oldImageName);

//     fs.unlink(oldImagePath, (error) => {
//       if(error){
//         console.error('Erreur lors de la suppression de l\'ancienne image:', error);
//       }
//     })
//   }

//   await Book.updateOne(
//     { _id: req.params.id }, 
//     { ...bookObject, _id: req.params.id, userID: req.auth.userID })
//   .then(() => res.status(200).json({ message: "Livre modifié"}))
//   .catch(error => res.status(400).json({ error }));