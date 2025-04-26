const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Book = require('../models/Book');

exports.getAllBooks = (req, res, next) => {
  Book.find()
  .then(books => res.status(200).json(books))
  .catch(error => res.status(400).json({ error }));
}

exports.createBook = async (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userID;
  
    // Prepare the new file name (.webp)
    const imageName = req.file.filename;
    const nameWithoutExt = path.parse(imageName).name;
    const webpFilename = `${nameWithoutExt}_${Date.now()}.webp`
    const imagePath = path.join(__dirname, '../images', webpFilename);
  
    // Convert the uploaded image to .webp and overwrite into /images
    await sharp(req.file.path)
    .webp({ quality: 20 })
    .toFile(imagePath);

    // Delete the original image (jpg/png)
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete original image:", err);
    });
  
    const book = new Book({
      ...bookObject,
      userID: req.auth.userID,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${webpFilename}`
    });

    await book.save()
    .then(() => res.status(201).json({ message: "Livre correctement ajouté" }))
    .catch(error => res.status(400).json({ error: "Erreur ::: ", error }))
}