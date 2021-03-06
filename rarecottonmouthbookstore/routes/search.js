const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/', (request, response, next) => {
  const searchOptions = request.query
  let page = (parseInt(request.query.page, 10))
  if (isNaN(page)) page = 1;
  if (!('genres' in searchOptions))
    searchOptions.genres = []
  if (!Array.isArray(searchOptions.genres))
    searchOptions.genres = [searchOptions.genres]
  Promise.all([
    database.getAllGenres(),
    database.searchBooksByTitleAuthorOrGenre(searchOptions, page)
    ])
    .then( results => {
      const genres = results[0]
      const books = results[1]
      response.render('search', {
        genres: genres,
        books: books,
        page: page,
        searchOptions: searchOptions
      })
    })
    .catch(error => {
      response.render('error', {error})
    })
})

module.exports = router;