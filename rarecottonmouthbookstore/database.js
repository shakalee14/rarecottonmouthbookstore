const databaseName = 'codex'
const connectionString = `postgres://${process.env.USER}@localhost:5432/${databaseName}`
const pgp = require('pg-promise')();
const db = pgp(connectionString);
const bcrypt = require('bcrypt-nodejs');

const createUser = ( attributes ) => {
  const sql = `
    INSERT INTO users
      (name, email, encrypted_password)
    VALUES
      ($1, $2, $3)
    RETURNING
      *
  `
  const encrypted_password = bcrypt.hashSync(attributes.password)
  const variables = [
    attributes.name,
    attributes.email,
    encrypted_password
  ]
  return db.one(sql, variables)
}

const getUserById = (user) => {
  const sql = `
    SELECT *
    FROM users 
    WHERE id = $1
    RETURNING *   
  `
  return db.one(sql, [user])
}

const getUserByEmail = (email) => {
  const sql = `
    SELECT *
    FROM users
    WHERE email=$1
    LIMIT 1
  `
  return db.oneOrNone(sql, [email])
}

const createBook = ( attributes ) => {
  const sql = `
    INSERT INTO books
      (title, imgurl)
    VALUES
      ($1, $2)
    RETURNING 
      *
  `
  
  const createBookQuery = db.one(sql, [attributes.title, attributes.imgurl])

  return Promise.all([
    createBookQuery,
    createAuthor({name: attributes.author})
  ]).then(results => {
    const book = results[0]
    const author = results[1]
    const queries = [
      associateAuthorWithBook(book.id, author.id)
    ]
    // Make into array if not an array of genres
    attributes.genres.forEach(genreId => {
      console.log('associateGenreWithBook', book.id, genreId)
      queries.push(associateGenreWithBook(book.id, genreId))
    })
    return Promise.all(queries).then(_ => book)
  })
}

const createAuthor = (input) => {
  const sql = `
    INSERT INTO authors
      (name)
    VALUES
      ($1)
    RETURNING 
      *
  `
  return db.one(sql, [input.name])
}

const createGenre = (input) => {
  const sql = `
    INSERT INTO genres
      (genre)
    VALUES
      ($1)
    RETURNING 
      *
  `
  return db.one(sql, [input.genre])
}


const associateAuthorWithBook = (bookId, authorId ) => {
  const sql = `
    INSERT INTO 
      book_authors(book_id, author_id)
    VALUES
      ($1, $2)
  `
  return db.none(sql, [bookId, authorId])
}


const associateGenreWithBook = (bookId, genreId) => {
  const sql = `
    INSERT INTO 
      book_genres(book_id, genre_id)
    VALUES
      ($1, $2)
  `
  return db.none(sql, [bookId, genreId])
}

const getAllBooks = (page=1) => {
  const offset = (page - 1) * 10;
  return db.many('SELECT * FROM books LIMIT 10 OFFSET $1', [offset])
    .then(getAuthorsandGenresForBooks)
}

const getAllGenres = () => {
  return db.many('SELECT * FROM genres')
}

const getGenresForBookIds = bookIds => {
  const sql = `
    SELECT genres.*, book_genres.book_id
    FROM genres 
    JOIN book_genres
    ON book_genres.genre_id = genres.id
    WHERE book_genres.book_id IN ($1:csv)
  `

  return db.any(sql, [bookIds])
}

const getAuthorsForBookIds = (bookIds) => {
  const sql = `
    SELECT authors.*, book_authors.book_id
    FROM authors 
    JOIN book_authors
    ON book_authors.author_id = authors.id
    WHERE book_authors.book_id IN ($1:csv)
  `

  return db.any(sql, [bookIds])
}

const getAuthorsandGenresForBooks = (books) => {
  console.log('booksf?1', books)
  const bookIds = books.map(book => book.id)
  console.log('book?', bookIds)
  return Promise.all([
    getAuthorsForBookIds(bookIds),
    getGenresForBookIds(bookIds)
  ])
    .then( results => {
      const authors = results[0]
      console.log('authors', authors)
      const genres = results[1]
      console.log('genres', genres)
      books.forEach(book => {
        book.authors = authors.filter(author => author.book_id === book.id)
        book.genres = genres.filter(genre => genre.book_id === book.id)
      })
      return books
   })
}

const getBookDetailsById = (bookId) => {
  const sql = `
    SELECT
      *
    FROM
      books
    WHERE
      id=$1
    LIMIT
      1
  `

  return Promise.all([
    db.oneOrNone(sql, [bookId]),
    getGenresForBookIds(bookId),
    getAuthorsForBookIds(bookId)
  ])
    .then(details => {
      const book = details[0]
      if (book){
        book.genres = details[1]
        book.authors = details[2]
      }
      return book
    })
}

const deleteBook = (bookId) => {
  const sql = `
    DELETE FROM books 
    WHERE id = $1
  `
  return db.none(sql, [bookId])
}


module.exports = {
  getAllGenres: getAllGenres,
  createUser: createUser,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail,
  createBook: createBook,
  createAuthor: createAuthor,
  createGenre: createGenre,
  getBookDetailsById: getBookDetailsById,
  deleteBook: deleteBook,
  getAllBooks: getAllBooks,
  getAuthorsandGenresForBooks: getAuthorsandGenresForBooks
}
