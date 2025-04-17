const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

async function initializeDatabase() {
  try {
    console.log('Начинаем инициализацию БД...');

    await runQuery(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, 'Таблица feedback успешно создана');

    await runQuery(`
      CREATE INDEX IF NOT EXISTS idx_feedback_email 
      ON feedback(email)
    `, 'Индекс для email в таблице feedback создан');

    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, 'Таблица users успешно создана');

    console.log('Инициализация БД завершена');
  } catch (error) {
    console.error('Ошибка при инициализации БД:', error.message);
  } finally {
    db.close();
  }
}

function runQuery(sql, successMessage) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        if (successMessage) console.log(successMessage);
        resolve();
      }
    });
  });
}

initializeDatabase();