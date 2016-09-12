var express = require('express');
var router = express.Router();

router.get('/', (request, response, next) => {
  response.redirect('/')
})

router.get('/new', (request, response, next) => {
  response.render('new')
})

router.get('/:id', (request, response, next) => {
  response.render('details')
})

router.post('/', (request, response, next) => {
  response.redirect('/books/:id')
})

router.delete('/:id', (request, response, next) => {
  response.redirect('/')
})

module.exports = router;
