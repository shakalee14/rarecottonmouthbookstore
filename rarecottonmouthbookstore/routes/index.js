var express = require('express');
var router = express.Router();
const database = require('../database')


/* GET home page. */
router.get('/', function(request, response, next) {
  // database.hgetUserById(request.session.userOId)
  database.getAllBooks()
    .then( books => {
      response.render('index', { 
        title: 'Codex',
        books: books, 
        session: request.session
      });
    }
    )
});

router.get('/signout', (request, response, next) => {
  request.session = null
  response.redirect('/')
})

module.exports = router;
