const mysql = require('mysql2/promise');
const { config } = require('../config');

const pool = mysql.createPool(config.database);

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

async function getConnection() {
  return pool.getConnection();
}

module.exports = {
  pool,
  query,
  execute,
  getConnection
};
