var express = require('express');
var router = express.Router();
const database = require('../database');


router.get('/', (request, response, next) => {
  const searchOptions = request.query
  if (!('genres' in searchOptions))
    searchOptions.genres = []
  if (!Array.isArray(searchOptions.genres))
    searchOptions.genres = [searchOptions.genres]
  Promise.all([
    database.getAllGenres(),
    database.searchBooksByTitleAuthorOrGenre(searchOptions)
    ])
    .then( results => {
      const genres = results[0]
      const books = results[1]
      response.render('search', {
        genres: genres,
        books: books,
        searchOptions: searchOptions
      })
    })
    .catch(error => {
      response.render('error', {error})
    })
})

module.exports = router;