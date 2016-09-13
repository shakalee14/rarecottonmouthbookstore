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

const getAllBooks =  () => {
  return db.many('SELECT * FROM books')
}

const getAllGenres = () => {
  return db.many('SELECT * FROM genres')
}

const getGenresForBookId = (bookId) => {
  const sql = `
    SELECT genres.* 
    FROM genres 
    JOIN book_genres
    ON genres.id = book_genres.genre_id
    WHERE book_genres.book_id = $1
  `

  return db.manyOrNone(sql, [bookId])
}

const getAuthorsForBookId = (bookId) => {
  const sql = `
    SELECT authors.* 
    FROM authors 
    JOIN book_authors
    ON authors.id = book_authors.author_id
    WHERE book_authors.book_id = $1
  `

  return db.manyOrNone(sql, [bookId])
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
    getGenresForBookId(bookId),
    getAuthorsForBookId(bookId)
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
  getAllBooks: getAllBooks
}
