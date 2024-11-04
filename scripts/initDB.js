// scripts/initDB.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const connectMongoose = require('../connectMongoose');

async function initDB() {
  await Product.deleteMany();
  await User.deleteMany();

  const users = await User.insertMany([
    { username: 'user1', email: 'user1@example.com', password: 'password1' },
    { username: 'user2', email: 'user2@example.com', password: 'password2' }
  ]);

  const products = [
    { name: 'Product 1', owner: users[0]._id, price: 100, image: 'image1.jpg', tags: ['work', 'lifestyle'] },
    { name: 'Product 2', owner: users[1]._id, price: 200, image: 'image2.jpg', tags: ['motor', 'mobile'] }
  ];

  await Product.insertMany(products);

  mongoose.connection.close();
}

initDB().catch(err => console.error(err));
