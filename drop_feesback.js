const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error('Ошибка подключения к БД:', err.message);
  }

  console.log('Подключено к базе данных');

  db.run('DROP TABLE IF EXISTS feedback;', (err) => {
    if (err) {
      console.error('Ошибка при удалении таблицы feedback:', err.message);
    } else {
      console.log('Таблица feedback успешно удалена');
    }

    db.close();
  });
});
