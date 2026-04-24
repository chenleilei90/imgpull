const { query, execute } = require('./mysql');

class BaseModel {
  static async findOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
  }

  static async findMany(sql, params = []) {
    return query(sql, params);
  }

  static async run(sql, params = []) {
    return execute(sql, params);
  }
}

module.exports = BaseModel;
