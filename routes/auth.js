const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Ruta de login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      req.session.userId = user._id;
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    next(error);
  }
});

// Ruta de logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
