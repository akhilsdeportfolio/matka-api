var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cron = require('node-cron');
const gamesController=require('./controllers/gamesController');
const userController = require('./controllers/userController');
const paymentController = require('./controllers/paymentsController');
const betsController=require('./controllers/betsController');
const transactionController = require('./controllers/transactionController');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(cors())
app.use(logger());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/games', gamesController);
app.use('/users', userController);
app.use('/payments', paymentController);
app.use('/bets', betsController);
app.use('/transactions', transactionController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
