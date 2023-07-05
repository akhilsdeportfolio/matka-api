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

var app = express();


/* cron.schedule('30 * * * * *', async () => {
  console.log("Running Cron :::::::::::")
  const data=await drawModel.find({date:{$eq:moment().format("DD-MM-YYYY")}}).exec();  
  const completedGames=data.filter((draw)=>{
    const diff=moment().diff(moment.unix(draw.openDrawTime))  
    return (diff > 0 && draw.status!=='CLOSED');
  });
  completedGames.forEach(async (draw)=>{
    await drawModel.findByIdAndUpdate(draw.id,{status:"CLOSED",openNumbers:[Math.round(Math.random()*9),Math.round(Math.random()*9),Math.round(Math.random()*9)],openNumbers:[Math.round(Math.random()*10),Math.round(Math.random()*10),Math.round(Math.random()*10)]}).exec();
  })

});

 */




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
