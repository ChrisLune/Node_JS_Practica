// config/i18n.js
const i18n = require('i18n');

i18n.configure({
  locales: ['en', 'es'],
  directory: __dirname + '/locales',
  defaultLocale: 'en',
  cookie: 'lang'
});

module.exports = i18n;
