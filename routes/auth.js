const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Importamos bcrypt para el manejo de contraseñas

// Ruta de login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      res.redirect('/');
    } else {
      res.redirect('/login?error=invalid_credentials');
    }
  } catch (error) {
    next(error);
  }
});

// Ruta de logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/'); // Manejo de errores en la destrucción de sesión
    }
    res.redirect('/');
  });
});

module.exports = router;
