const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Успешное подключение к базе данных');

    // Включаем поддержку внешних ключей
    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) {
        console.error('Ошибка при включении foreign_keys:', err.message);
      } else {
        console.log('foreign_keys включены');
      }

      checkTables(); // Проверку таблиц запускаем только после установки PRAGMA
    });
  }
});

function checkTables() {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error("Ошибка при проверке таблиц:", err);
    } else {
      console.log("Существующие таблицы:", tables.map(t => t.name).join(', ') || 'нет таблиц');

      // Проверка наличия обязательных таблиц
      const requiredTables = ['users', 'feedback'];
      const missingTables = requiredTables.filter(t => !tables.some(table => table.name === t));

      if (missingTables.length > 0) {
        console.warn(`ВНИМАНИЕ: Отсутствуют обязательные таблицы: ${missingTables.join(', ')}`);
        console.warn('Запустите init_db.js для инициализации базы данных');
      }
    }
  });
}

// Добавляем методы для работы с промисами
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

module.exports = db;
