var express = require('express');
var router = express.Router();
const db = require('../database'); // Подключаем БД

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/* GET home page. */

router.get('/', (req, res) => {
  console.log('Session user in route:', req.session.user); 
  res.render('index', {
    title: 'Советы для фермеров',
    user: req.session.user,
    _SESSION: req.session,
    userData: JSON.stringify(req.session.user || null)
  });
});

// Ваши существующие роуты
router.get('/vegetables', function(req, res, next) {
  res.render('vegetables', { title: 'Овощи' });
});

router.get('/fruits', function(req, res, next) {
  res.render('fruits', { title: 'Фрукты' });
});

router.get('/flowers', function(req, res, next) {
  res.render('flowers', { title: 'Цветы' });
});

router.get('/cows', function(req, res, next) {
  res.render('cows', { title: 'Коровы' });
});

router.get('/birds', function(req, res, next) {
  res.render('birds', { title: 'Птицы' });
});

router.get('/horses', function(req, res, next) {
  res.render('horses', { title: 'Лошади' });
});


// Новые роуты для работы с обратной связью (добавляем в конец файла)
router.post('/feedback', (req, res) => {
  const { name, email, message } = req.body;
  
  db.run(
    'INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка сохранения' });
      }
      res.json({ 
        status: 'ok', 
        message: `Спасибо, ${name}! Ваше сообщение сохранено` 
      });
    }
  );
});

// Роут для получения всех сообщений (например, для админки)
router.get('/feedback/all', (req, res) => {
  db.all('SELECT * FROM feedback ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка чтения' });
    }
    res.json(rows);
  });
});

module.exports = router;