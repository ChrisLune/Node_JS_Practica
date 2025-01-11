const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
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
  res.status(401).json({ message: 'Unauthorized' });
}

// Ruta para hacer login y obtener JWT
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: 'Login failed' });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
      return res.json({ token });
    });
  })(req, res, next);
});

// Ruta para obtener la lista de productos
router.get('/products', isLoggedIn, async (req, res, next) => {
  try {
    const { skip = 0, limit = 10, sort = 'name', tag, priceMin, priceMax, name } = req.query;

    const filter = { owner: req.user._id };
    if (tag) filter.tags = tag;
    if (priceMin) filter.price = { $gte: priceMin };
    if (priceMax) filter.price = { ...filter.price, $lte: priceMax };
    if (name) filter.name = { $regex: `^${name}`, $options: 'i' };

    const products = await Product.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort(sort);

    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Ruta para obtener un producto
router.get('/products/:id', isLoggedIn, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Ruta para crear un producto
router.post('/products', isLoggedIn, upload.single('image'), async (req, res, next) => {
  try {
    const { name, price, tags } = req.body;
    const owner = req.user._id;
    const image = req.file ? req.file.filename : '';

    const product = new Product({ name, owner, price, image, tags });
    await product.save();

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Ruta para actualizar un producto
router.put('/products/:id', isLoggedIn, async (req, res, next) => {
  try {
    const { name, price, tags } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.owner.equals(req.user._id)) {
      product.name = name;
      product.price = price;
      product.tags = tags;
      await product.save();
      res.json(product);
    } else {
      res.status(403).json({ message: 'No tienes permiso para actualizar este producto' });
    }
  } catch (err) {
    next(err);
  }
});

// Ruta para eliminar un producto
router.delete('/products/:id', isLoggedIn, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.owner.equals(req.user._id)) {
      await product.remove();
      res.json({ message: 'Product deleted' });
    } else {
      res.status(403).json({ message: 'No tienes permiso para eliminar este producto' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
