var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(request, response, next) {
  response.send('respond with a resource');
});

router.get('/signin', (request, response, next) => {
  response.render('signin')
})

router.get('/signup', (request, response, next) => {
  response.render('signup')
})


module.exports = router;
