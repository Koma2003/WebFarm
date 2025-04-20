const express = require('express');
const router = express.Router();
const db = require('../database'); // Подключаем БД

/*я хз используется ли ваще этот файл*/ 

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    res.redirect('/login');
  } catch (err) {
    res.send('Пользователь с таким именем уже существует');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.send('Неверный логин или пароль');
  }

  req.session.userId = user.id;
  res.redirect('/form'); // или на главную
});

module.exports = router;
