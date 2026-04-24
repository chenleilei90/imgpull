const BaseModel = require('../db/base-model');

class WorkerNodeModel extends BaseModel {
  static findByCode(nodeCode) {
    return this.findOne(
      `SELECT *
       FROM worker_nodes
       WHERE node_code = ?
       LIMIT 1`,
      [nodeCode]
    );
  }

  static create({ nodeCode, nodeName, region }) {
    return this.run(
      `INSERT INTO worker_nodes (
         node_code, node_name, region, status, health_status, weight, current_load, current_task_count
       ) VALUES (?, ?, ?, 'active', 'healthy', 100, 0, 0)`,
      [nodeCode, nodeName, region]
    );
  }

  static touchHeartbeat(id) {
    return this.run(
      `UPDATE worker_nodes
       SET last_heartbeat_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [id]
    );
  }

  static increaseTaskCount(id) {
    return this.run(
      `UPDATE worker_nodes
       SET current_task_count = current_task_count + 1,
           current_load = current_load + 1,
           updated_at = NOW()
       WHERE id = ?`,
      [id]
    );
  }

  static decreaseTaskCount(id) {
    return this.run(
      `UPDATE worker_nodes
       SET current_task_count = GREATEST(current_task_count - 1, 0),
           current_load = GREATEST(current_load - 1, 0),
           updated_at = NOW()
       WHERE id = ?`,
      [id]
    );
  }
}

module.exports = WorkerNodeModel;
