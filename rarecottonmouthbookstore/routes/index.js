var express = require('express');
var router = express.Router();
const database = require('../database')

router.get('/', function(request, response, next) {
  let page = (parseInt(request.query.page, 10))
  if (isNaN(page)) page = 1;
  console.log(page)
  Promise.all([
    database.getAllBooks(page),
    database.getUserById(request.session.userId || 1)
  ])
    .then( data => {
      // console.log('books2', books)
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

// router.get('/', function(request, response, next) {
//   let page = (parseInt(request.query.page, 10))
//   if (isNaN(page)) page = 1;
//   console.log(page)
//   database.getAllBooks(page)
//     .then( books => {
//       // console.log('books2', books)
//       response.render('index', { 
//         title: 'Codex',
//         page: page,
//         books: books, 
//         session: request.session
//       });
//     })
//     .catch(error => {
//       response.render('error', {error: error})
//     })
// });

router.get('/signout', (request, response, next) => {
  request.session = null
  response.redirect('/')
})

module.exports = router;
