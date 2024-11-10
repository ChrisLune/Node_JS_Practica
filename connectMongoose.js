// connectMongoose.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodepop');
mongoose.connection.on('error', err => {
  console.error('Error de conexión a MongoDB', err);
});
mongoose.connection.once('open', () => {
  console.log('Conectado a MongoDB');
});