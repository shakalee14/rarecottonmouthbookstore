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
    createAuthors(attributes.authors)
  ]).then(results => {
    const book = results[0]
    const authors = results[1]
    const queries = [
      associateAuthorsWithBook(book, authors),
      associateGenresWithBook(book, attributes.genres)
    ]
    return Promise.all(queries).then(() => book)
  })
}

const createAuthors = (authors) => {
  const queries = authors.map(author => {
    const sql = `
      INSERT INTO authors
        (name)
      VALUES
        ($1)
      RETURNING 
        *
    `  
    return db.one(sql, [author])
  })
  return Promise.all(queries)
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


const associateAuthorsWithBook = (book, authors) => {
  const queries = authors.map(author => {
    const sql = `
      INSERT INTO 
        book_authors(book_id, author_id)
      VALUES
        ($1, $2)
    `
    return db.none(sql, [book.id, author.id])
  })
  return Promise.all(queries)
}


const associateGenresWithBook = (book, genres) => {
  const queries = genres.map(genreId => {
    const sql = `
      INSERT INTO 
        book_genres(book_id, genre_id)
      VALUES
        ($1, $2)
    `
    return db.none(sql, [book.id, genreId])
  })
  return Promise.all(queries)
}

const getAllBooks = (page=1) => {
  const offset = (page - 1) * 10;
  return db.many('SELECT * FROM books LIMIT 10 OFFSET $1', [offset])
    .then(getAuthorsandGenresForBooks)
}

const getAllGenres = () => {
  return db.any('SELECT * FROM genres')
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
  const bookIds = books.map(book => book.id)
  if (bookIds.length === 0) return Promise.resolve(books)
  return Promise.all([
    getAuthorsForBookIds(bookIds),
    getGenresForBookIds(bookIds)
  ])
    .then( results => {
      const authors = results[0]
      const genres = results[1]
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

const searchBooksByTitleAuthorOrGenre = (options, page=1) => {
  let variables = []
  let sql = `
    SELECT DISTINCT (books.*)
    FROM books
  `
  let whereConditions = []
  if (options.genres.length > 0 ) {
    sql += `
      LEFT JOIN book_genres
      ON book_genres.book_id = books.id
    `
    variables.push(options.genres)
    whereConditions.push(`
      book_genres.genre_id IN ($${variables.length}:csv)
    `)
  }
  if (options.search_query) {
    sql += `
      LEFT JOIN book_authors
      ON book_authors.book_id = books.id
      LEFT JOIN authors
      ON authors.id=book_authors.author_id
    `
    variables.push(
      `%${options.search_query.toLowerCase().replace(/ +/, '%')}%`
    )
    whereConditions.push(`
      (
        LOWER(books.title) LIKE $${variables.length}
      OR 
        LOWER(authors.name) LIKE $${variables.length}
      )
    `)
  }
  if (whereConditions.length > 0) {
    sql += ' WHERE '+whereConditions.join(' AND ')
  }
  const offset = (page - 1) * 10;
  variables.push(offset)
  sql += `
    LIMIT 10 OFFSET $${variables.length}
  `
  console.log('---->', sql, variables)
  return db.any(sql, variables).then(getAuthorsandGenresForBooks)
}


module.exports = {
  getAllGenres: getAllGenres,
  createUser: createUser,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail,
  createBook: createBook,
  createAuthors: createAuthors,
  createGenre: createGenre,
  getBookDetailsById: getBookDetailsById,
  deleteBook: deleteBook,
  getAllBooks: getAllBooks,
  getAuthorsandGenresForBooks: getAuthorsandGenresForBooks,
  searchBooksByTitleAuthorOrGenre: searchBooksByTitleAuthorOrGenre
}
