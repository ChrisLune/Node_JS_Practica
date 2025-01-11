const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const connectMongoose = require('./connectMongoose');
const i18n = require('./config/i18n');
const apiRoutes = require('./routes/api');

const app = express();

// Configurar EJS como el motor de plantillas por defecto
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(i18n.init);

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/api', apiRoutes);

module.exports = app;
