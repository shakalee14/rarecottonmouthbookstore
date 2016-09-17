const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/', (request, response, next) => {
  response.render('signup')
})

router.post('/', (request, response) => {
  database.createUser( request.body )
  .then( user => {
    request.session.userId = user.id;
    response.redirect('/');
  })
  .catch( error => response.render('error', {error: error}))
})

module.exports = router;
