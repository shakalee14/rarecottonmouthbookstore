const express = require('express');
const router = express.Router();
const database = require('../database')

router.get('/', function(request, response, next) {
  let page = (parseInt(request.query.page, 10))
  if (isNaN(page)) page = 1;
  Promise.all([
    database.getAllBooks(page),
    database.getUserById(request.session.userId || 1)
  ])
    .then( data => {
      const books = data[0]
      const user = data[1]  
      response.render('index', { 
        title: 'Codex',
        page: page,
        books: books, 
        session: request.session,
        user: user
      })
    })
    .catch(error => {
      response.render('error', {error: error})
    })
});

router.get('/signout', (request, response, next) => {
  request.session = null
  response.redirect('/')
})

module.exports = router;
