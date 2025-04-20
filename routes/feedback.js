const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');


// Валидация для тела запроса
const feedbackValidation = [
  body('name').trim().notEmpty().withMessage('Имя не может быть пустым'),
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Сообщение не может быть пустым')
];//


// Обработчик для добавления нового сообщения
router.post('/', feedbackValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;
  const currentTime = new Date().toISOString();
  
  db.run(
    `INSERT INTO feedback (name, email, message, created_at) VALUES (?, ?, ?, ?)`,
    [name, email, message, currentTime],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка сохранения' });
      }
      res.json({ 
        status: 'ok', 
        message: `Спасибо ${name}! Ваше сообщение сохранено ` 
      });
    }
  );
});

router.get('/', (req, res) => {
  db.all(
    `SELECT id, name, email, message, 
     datetime(created_at, 'localtime') as date 
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
