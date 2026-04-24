const RegistryAccountModel = require('../../models/registry-account.model');
const SubscriptionModel = require('../../models/subscription.model');
const AppError = require('../../utils/app-error');
const { encryptSecret, decryptSecret } = require('../../utils/crypto');
const { getExecutor } = require('../../executors');

function sanitizeRegistryAccount(account) {
  if (!account) {
    return account;
  }

  const sanitized = { ...account };
  delete sanitized.secret_encrypted;
  delete sanitized.secret;
  delete sanitized.token;
  delete sanitized.password;
  return sanitized;
}

class RegistryService {
  static async list(userId) {
    const items = await RegistryAccountModel.listByUserId(userId);
    return items.map(sanitizeRegistryAccount);
  }

  static async create(userId, payload) {
    await this.assertSubscriptionRegistryLimit(userId);
    this.validatePayload(payload, { requireSecret: true });

    const duplicate = await RegistryAccountModel.findDuplicate({
      userId,
      registryHost: payload.registry_host,
      namespaceName: payload.namespace_name,
      username: payload.username
    });

    if (duplicate) {
      throw new AppError(409, 40911, 'registry configuration already exists');
    }

    if (payload.is_default) {
      await RegistryAccountModel.clearDefaultByUserId(userId);
    }

    const result = await RegistryAccountModel.create({
      userId,
      name: payload.name,
      registryType: payload.registry_type,
      registryHost: payload.registry_host,
      region: payload.region || null,
      namespaceName: payload.namespace_name,
      username: payload.username,
      secretEncrypted: encryptSecret(payload.secret),
      isDefault: !!payload.is_default,
      remark: payload.remark || null
    });

    const created = await RegistryAccountModel.findByIdForUser(result.insertId, userId);
    return sanitizeRegistryAccount(created);
  }

  static async update(userId, id, payload) {
    const existing = await RegistryAccountModel.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, 40411, 'registry account not found');
    }

    this.validatePayload(payload, { requireSecret: false });

    const duplicate = await RegistryAccountModel.findDuplicate({
      userId,
      registryHost: payload.registry_host,
      namespaceName: payload.namespace_name,
      username: payload.username,
      excludeId: id
    });

    if (duplicate) {
      throw new AppError(409, 40912, 'updated registry configuration conflicts with existing one');
    }

    if (payload.is_default) {
      await RegistryAccountModel.clearDefaultByUserId(userId);
    }

    await RegistryAccountModel.update(id, userId, {
      name: payload.name,
      registryType: payload.registry_type,
      registryHost: payload.registry_host,
      region: payload.region || null,
      namespaceName: payload.namespace_name,
      username: payload.username,
      secretEncrypted: payload.secret ? encryptSecret(payload.secret) : existing.secret_encrypted,
      isDefault: !!payload.is_default,
      remark: payload.remark || null
    });

    const updated = await RegistryAccountModel.findByIdForUser(id, userId);
    return sanitizeRegistryAccount(updated);
  }

  static async remove(userId, id) {
    const existing = await RegistryAccountModel.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, 40412, 'registry account not found');
    }

    if (Number(existing.is_default) === 1) {
      throw new AppError(400, 40021, 'default registry cannot be deleted directly');
    }

    await RegistryAccountModel.softDelete(id, userId);
    return { id };
  }

  static async setDefault(userId, id) {
    const existing = await RegistryAccountModel.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, 40413, 'registry account not found');
    }

    await RegistryAccountModel.setDefault(id, userId);
    return { id };
  }

  static async testConnection(userId, id) {
    const account = await RegistryAccountModel.findByIdForUser(id, userId);
    if (!account) {
      throw new AppError(404, 40414, 'registry account not found');
    }

    const secret = decryptSecret(account.secret_encrypted);
    const executor = getExecutor();
    let result;

    try {
      const testResult = await executor.testRegistryConnection({
        registryHost: account.registry_host,
        username: account.username,
        secret
      });

      result = {
        status: 'success',
        code: testResult.code || 'ok',
        message: testResult.message || 'registry connection ok'
      };
    } catch (error) {
      result = {
        status: 'failed',
        code: error.code || 'runtime_unavailable',
        message: String(error.message || error).slice(0, 500)
      };
    }

    await RegistryAccountModel.updateTestResult(id, userId, result);
    return result;
  }

  static async assertSubscriptionRegistryLimit(userId) {
    const subscription = await SubscriptionModel.findActiveByUserId(userId);
    if (!subscription) {
      return;
    }

    const list = await RegistryAccountModel.listByUserId(userId);
    if (list.length >= subscription.max_registry_accounts) {
      throw new AppError(403, 40311, 'registry binding limit reached for current plan');
    }
  }

  static validatePayload(payload, options = {}) {
    const required = ['name', 'registry_type', 'registry_host', 'namespace_name', 'username'];
    if (options.requireSecret) {
      required.push('secret');
    }

    for (const field of required) {
      if (!payload[field]) {
        throw new AppError(400, 40022, `field ${field} is required`);
      }
    }

    if (!['harbor', 'acr', 'tcr'].includes(payload.registry_type)) {
      throw new AppError(400, 40023, 'unsupported registry type');
    }
  }
}

module.exports = RegistryService;
