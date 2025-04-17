const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database');
const { body, validationResult } = require('express-validator'); // Добавлен импорт

// Валидация для регистрации
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Имя пользователя должно быть не менее 3 символов'),
  body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов')
];

// Валидация для входа
const loginValidation = [
  body('username').trim().notEmpty().withMessage('Имя пользователя обязательно'),
  body('password').notEmpty().withMessage('Пароль обязателен')
];


// Регистрация
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Проверка существующего пользователя
    const existingUser = await db.getAsync(
      'SELECT * FROM users WHERE username = ? OR email = ?', 
      [username, email]
    );

    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email';
      return res.status(409).json({ 
        message: `Пользователь с таким ${field} уже существует` 
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const result = await db.runAsync(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Сохранение в сессии
    req.session.user = {
      id: result.lastID,
      username
    };
    console.log('Авторизация успешна, данные сессии:', req.session.user);


    res.json({ 
      message: 'Успешная регистрация',
      user: { id: result.lastID, username }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// Вход
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({message: errors.array().map(err => err.msg).join(', ') });
  }

  const { username, password } = req.body;

  try {
    const user = await db.getAsync(
      'SELECT * FROM users WHERE username = ?', 
      [username]
    );

    if (!user) {
      return res.status(401).json({ 
        message: 'Неверное имя пользователя или пароль' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Неверное имя пользователя или пароль' 
      });
    }

    // Сохранение в сессии
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email 
    };
    await new Promise((resolve, reject) => {
      req.session.save(err => err ? reject(err) : resolve());
    });

    res.json({ 
      message: 'Успешный вход',
      user: {username: user.username }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }

});


// Выход
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Ошибка выхода:', err);
      return res.status(500).json({ message: 'Ошибка при выходе' });
    }
    res.clearCookie('user_sid');
    res.json({ message: 'Выход выполнен' });
  });
});

router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Пользователь не авторизован' });
  }
});


module.exports = router;