// routes/index.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const passport = require('passport');
const multer = require('multer');
const path = require('path');

// Configurar multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Middleware para proteger rutas
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Ruta principal
router.get('/', async (req, res, next) => {
  try {
    const { skip = 0, limit = 10, sort = 'name', tag, priceMin, priceMax, name } = req.query;

    const filter = {};
    if (tag) filter.tags = tag;
    if (priceMin) filter.price = { $gte: priceMin };
    if (priceMax) filter.price = { ...filter.price, $lte: priceMax };
    if (name) filter.name = { $regex: `^${name}`, $options: 'i' };

    const products = await Product.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort(sort);

    res.render('index', { products, user: req.user });
  } catch (err) {
    next(err);
  }
});

// Ruta para agregar productos
router.post('/products', isLoggedIn, upload.single('image'), async (req, res, next) => {
  try {
    const { name, price, tags } = req.body;
    const owner = req.user._id;
    const image = req.file ? req.file.filename : '';

    const product = new Product({ name, owner, price, image, tags });
    await product.save();

    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Ruta para eliminar productos
router.delete('/products/:id', isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (product.owner.equals(req.user._id)) {
      await product.remove();
      res.redirect('/');
    } else {
      res.status(403).send('No tienes permiso para eliminar este producto');
    }
  } catch (err) {
    next(err);
  }
});

// Rutas de autenticación
router.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

module.exports = router;
