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



module.exports = {
  createUser: createUser,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail
}
