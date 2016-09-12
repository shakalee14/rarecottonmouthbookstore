var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(request, response, next) {
  // database.hgetUserById(request.session.userOId)
    response.render('index', { 
      title: 'Codex', 
      session: request.session
    });
});

router.get('/signout', (request, response, next) => {
  request.session = null
  response.redirect('/')
})

module.exports = router;
