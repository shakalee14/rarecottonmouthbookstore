var express = require('express');
var router = express.Router();
const database = require('../database')

router.get('/', (request, response, next) => {
  response.redirect('/')
})

router.get('/new', (request, response, next) => {
  database.getAllGenres()
    .then(genres => {
      response.render('books/new',{
        genres: genres
      })
    })
    .catch(error => {
      response.render('error', {error: error})
    })
})

router.get('/:bookId', (request, response, next) => {
  database.getBookDetailsById(request.params.bookId)
    .then(book => {
      if(book){
        response.render('books/show',{
        book: book
      }) 
    }else{
        response.render('books/show', {
          book: 'ERROR'
        })
      }
    })
    .catch(error => {
      response.render('error', {
        error: error
      })
    })
})




router.post('/', (request, response, next) => {
  const bookAttributes = request.body
  if (!Array.isArray(bookAttributes.genres)){
    bookAttributes.genres = 'genres' in bookAttributes ? [bookAttributes.genres] : []
  }
  
  bookAttributes.authors = bookAttributes.authors.filter(author => author !== '')

  database.createBook(bookAttributes)
    .then(book => {
      response.redirect('/books/'+book.id)
    })
    .catch(error => {
      response.render('error', {error: error})
    })

})

router.get('/delete/:id', (request, response, next) => {
  database.deleteBook(request.params.id)
    .then(book => {
      response.redirect('/')
    })
    .catch(error => {
      response.render('error', {error: error})
    })
})

module.exports = router;
