const databaseName = 'codex'
const connectionString = `postgres://${process.env.USER}@localhost:5432/${databaseName}`
const pgp = require('pg-promise')();
const db = pgp(connectionString);

const createUser = ( attributes ) => {
  const sql = `
    INSERT INTO users
      (name, email, encrypted_password)
    VALUES
      ($1, $2, $3)
    RETURNING
      *
  `
  return db.one(sql, [attributes.name, attributes.email, attributes.password])
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

const authenticateUser = (email) => {
  const sql = `
    SELECT id, encrypted_password
    FROM users
    WHERE email=$1
    LIMIT 1
  `
  return db.one(sql, [email])
}



module.exports = {
  createUser: createUser,
  getUserById: getUserById,
  authenticateUser: authenticateUser
}
