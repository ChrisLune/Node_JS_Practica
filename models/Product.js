const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  owner: { ref: 'User', type: mongoose.Schema.Types.ObjectId },
  price: Number,
  image: String,
  tags: [String]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;