// routes/index.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

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

    res.render('index', { products });
  } catch (err) {
    next(err);
  }
});

router.post('/products', async (req, res, next) => {
  try {
    const { name, price, image, tags } = req.body;
    const owner = req.user._id;

    const product = new Product({ name, owner, price, image, tags });
    await product.save();

    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', async (req, res, next) => {
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

module.exports = router;
