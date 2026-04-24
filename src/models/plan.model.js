const BaseModel = require('../db/base-model');

class PlanModel extends BaseModel {
  static findByCode(code) {
    return this.findOne(
      `SELECT *
       FROM plans
       WHERE code = ? AND status = 'active'
       LIMIT 1`,
      [code]
    );
  }

  static findById(id) {
    return this.findOne(
      `SELECT *
       FROM plans
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
  }
}

module.exports = PlanModel;
