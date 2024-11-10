// routes/index.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const passport = require('passport');

// Middleware para verificar autenticación
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Función para construir filtros de productos
function buildFilters(query) {
  const { tag, priceMin, priceMax, name } = query;
  const filter = {};
  if (tag) filter.tags = tag;
  if (priceMin) filter.price = { $gte: priceMin };
  if (priceMax) filter.price = { ...filter.price, $lte: priceMax };
  if (name) filter.name = { $regex: `^${name}`, $options: 'i' };
  return filter;
}

// Obtener productos con filtros
router.get('/', async (req, res, next) => {
  try {
    const { skip = 0, limit = 10, sort = 'name' } = req.query;
    const filter = buildFilters(req.query);
    const products = await Product.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort(sort);
    res.render('index', { products });
  } catch (err) {
    next(err);
  }
});

// Crear un nuevo producto
router.post('/products', isLoggedIn, async (req, res, next) => {
  try {
    const product = new Product({
      ...req.body,
      owner: req.user._id
    });
    await product.save();
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Eliminar un producto
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
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Crear una nueva entrada
router.get('/create', isLoggedIn, (req, res) => {
  res.render('create');
});

router.post('/create', isLoggedIn, async (req, res, next) => {
  try {
    const product = new Product({
      ...req.body,
      owner: req.user._id
    });
    await product.save();
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Eliminar un producto desde la vista
router.get('/delete/:id', isLoggedIn, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.owner.toString() !== req.user._id.toString()) {
      return res.redirect('/');
    }
    await product.remove();
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
