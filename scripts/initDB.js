const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const connectMongoose = require('../connectMongoose');

async function initDB() {
  await Product.deleteMany();
  await User.deleteMany();

  const users = await User.insertMany([
    { username: 'admin', email: 'admin@example.com', password: '1234' },
    { username: 'user', email: 'user@example.com', password: '1234' },
    { username: 'supervisor', email: 'supervisor@example.com', password: '1234' },
    { username: 'manager', email: 'manager@example.com', password: '1234' },
    { username: 'coordinator', email: 'coordinator@example.com', password: '1234' }
  ]);

  const products = [
    { name: 'Laptop', owner: users[0]._id, price: 500, image: 'images/image1.jpg', tags: ['work', 'Dell'] },
    { name: 'Phone', owner: users[1]._id, price: 250, image: 'images/image2.jpg', tags: ['mobile', 'Iphone'] },
    { name: 'Tablet', owner: users[2]._id, price: 300, image: 'images/image3.jpg', tags: ['portable', 'Samsung'] },
    { name: 'Monitor', owner: users[3]._id, price: 200, image: 'images/image4.jpg', tags: ['work', 'LG'] },
    { name: 'Keyboard', owner: users[4]._id, price: 50, image: 'images/image5.jpg', tags: ['accessory', 'Logitech'] }
  ];

  await Product.insertMany(products);

  mongoose.connection.close();
}

initDB().catch(err => console.error(err));
