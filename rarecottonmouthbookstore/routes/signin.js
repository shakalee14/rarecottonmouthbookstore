const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/', (request, response, next) => {
  response.render('signin')
})

router.post('/', (request, response) => {
  const email = request.body.email
  const password = request.body.password

  database.getUserByEmail(email, password)
    .then(user => {
      if(user){
        request.session.userId = user.id
        response.redirect('/')
      }else{
        response.render('signin', {
          error: 'Email or Password Not Found'
        })
      }
    })
    .catch(error => {
      response.render('error', {
        error: error
      })
    })
})

module.exports = router;
