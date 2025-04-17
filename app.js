var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contactRouter = require('./routes/contact');
const feedbackRouter = require('./routes/feedback');
const authRouter = require('./routes/auth'); // 👈 Новый роут для регистрации/логина

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(session({
  key: 'user_sid',
  secret: '3333333',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 6200000,
    httpOnly: true,
    secure: false,
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


// Отключение кэширования шаблонов (для разработки)
app.set('view cache', false);

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // ваш фронтенд-адрес
  credentials: true,
  exposedHeaders: ['set-cookie']
}));


app.get('/', (req, res) => {
  console.log('USER В СЕССИИ:', req.session.user);
  res.render('index', { user: req.session.user || null });
});

app.use(express.static(path.join(__dirname, 'public')));

// Middleware: автоудаление сессии, если cookie устарел
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});


// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/contact', contactRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/auth', authRouter); // 👈 сюда попадут /auth/register и /auth/login


// 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
