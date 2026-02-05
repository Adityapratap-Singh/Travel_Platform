const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  location: String,
  duration: String,
  price: Number,
  image: String,
  category: String
});

module.exports = mongoose.model('Experience', experienceSchema);