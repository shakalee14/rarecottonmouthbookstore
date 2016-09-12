var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');

const database = require('./database');
const pgp = database.pgp;

var routes = require('./routes/index');
var users = require('./routes/users');
var books = require('./routes/books');
var search = require('./routes/search');
var signup = require('./routes/signup');
var signin = require('./routes/signin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', 1);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.use((request, response, next) => {
  response.locals.signedIn = 'userId' in request.session
  // request.getCurrentUser = function(){
  //   database.getUserById(request.session.userId)
  //     .then(user => {
  //       response.locals.currentUser = user
  //       return user;
  //     })
  // }
  next();
})

app.use('/', routes);
app.use('/users', users);
app.use('/books', books);
app.use('/search', search);
app.use('/signup', signup);
app.use('/signin', signin);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
