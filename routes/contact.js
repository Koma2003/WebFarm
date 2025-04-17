// contact.js или в вашем маршруте для страницы обратной связи
const express = require('express');
const router = express.Router();
//const { sessionCheck } = require('./auth');  // Импортируем функцию sessionCheck

// Применяем sessionCheck ко всем запросам на страницу /contact
// router.get('/', sessionCheck, function(req, res) {
//   res.render('contact', {
//     title: 'Whitesquare',
//     pname: 'CONTACT',
//     user: req.session.user,
//     navmenu: navmenu
//   });
// });

module.exports = router;
