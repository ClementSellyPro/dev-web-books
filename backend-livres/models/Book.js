const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: String, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: {
        //type: Schema.Types.ObjectId, // references a MongoDB ObjectId
        type: String,
        //ref: 'User', // optional: if you have a User model
        required: true,
      },
      grade: {
        type: Number,
        min: 0,
        max: 5,
        required: true,
      }
    }
  ],
  averageRating: { type: Number}
})

module.exports = mongoose.model('Book', bookSchema);