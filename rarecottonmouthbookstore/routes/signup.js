var express = require('express');
var router = express.Router();


router.get('/', (request, response, next) => {
  response.render('signup')
})

router.post('/', (request, response) => {
  response.json(request.body)
})


module.exports = router;
