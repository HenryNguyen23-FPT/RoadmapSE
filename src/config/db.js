const mysql = require('mysql2/promise');
require('dotenv').config();

pool
  .getConnection()
  .then((connection) => {
    console.log('Connected to MySQL successfully');
    connection.release();
  })
  .catch((error) => {
    console.error('Database connection error:', error.message);
  });

module.exports = pool;
