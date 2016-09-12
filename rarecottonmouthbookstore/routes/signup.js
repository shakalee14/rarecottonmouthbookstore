var express = require('express');
var router = express.Router();
const database = require('../database');



router.get('/', (request, response, next) => {
  response.render('signup')
})

router.post('/', (request, response) => {
  // response.json( request.body )
  database.createUser( request.body )
  .then( user => {
    request.session.userId = user.id;
    response.redirect('/');
  })
  .catch( error => response.render('error', {error: error}))
})



module.exports = router;
