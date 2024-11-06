const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Crear producto
router.post('/', async (req, res, next) => {
  try {
    const { name, price, image, tags } = req.body;
    const product = new Product({
      name,
      owner: req.session.userId,
      price,
      image,
      tags
    });
    await product.save();
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

// Borrar producto
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.owner.toString() === req.session.userId) {
      await product.remove();
      res.redirect('/');
    } else {
      res.status(403).send('No tienes permiso para borrar este producto');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
