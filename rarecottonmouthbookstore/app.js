const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');


const database = require('./database');
const pgp = database.pgp;

const routes = require('./routes/index');
const users = require('./routes/users');
const books = require('./routes/books');
const search = require('./routes/search');
const signup = require('./routes/signup');
const signin = require('./routes/signin');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', 1);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  name: 'session',
  keys: ['9B7^T(cL.6335P1D<o2`;Y"S1FWXTY', 'MG62S3V7t5yioNo8o9r6T8SSCsde81q3']
}))

app.use((request, response, next) => {
  response.locals.signedIn = 'userId' in request.session
  next();
})

app.use('/', routes);
app.use('/users', users);
app.use('/books', books);
app.use('/search', search);
app.use('/signup', signup);
app.use('/signin', signin);

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
