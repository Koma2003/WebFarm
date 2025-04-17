const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');


// Валидация для тела запроса
const feedbackValidation = [
  body('name').trim().notEmpty().withMessage('Имя не может быть пустым'),
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Сообщение не может быть пустым')
];

const sessionCheck = (req, res, next) => {
  console.log('Session in middleware:', req.session); // Добавьте лог
  if (!req.session.user) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  next();
};

// Защищаем все маршруты


// Обработчик для добавления нового сообщения
router.post('/', feedbackValidation, (req, res) => {
  const { name, email, message } = req.body;
  
  db.run(
    `INSERT INTO feedback (name, email, message) 
     VALUES (?, ?, ?)`,
    [name, email, message],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка сохранения' });
      }
      res.json({ 
        status: 'ok', 
        message: `Спасибо! Ваше сообщение сохранено ` 
      });
    }
  );
});

router.get('/', (req, res) => {
  db.all(
    `SELECT id, name, email, message, 
     strftime('%d.%m.%Y %H:%M', created_at) as date 
     FROM feedback ORDER BY created_at DESC`,
    [], 
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка чтения' });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
