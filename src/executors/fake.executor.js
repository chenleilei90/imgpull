const { config } = require('../config');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class FakeExecutor {
  getDriverName() {
    return 'fake';
  }

  async testRegistryConnection({ registryHost, username }) {
    await sleep(config.executor.fakeDelayMs);
    return {
      code: 'ok',
      message: `fake registry connection ok for ${username}@${registryHost}`
    };
  }

  async pull(sourceRef) {
    await sleep(config.executor.fakeDelayMs);
    return `fake pull ${sourceRef}`;
  }

  async tag(sourceRef, targetRef) {
    await sleep(config.executor.fakeDelayMs);
    return `fake tag ${sourceRef} -> ${targetRef}`;
  }

  async login(registryHost, username) {
    await sleep(config.executor.fakeDelayMs);
    return `fake login ${username}@${registryHost}`;
  }

  async push(targetRef) {
    await sleep(config.executor.fakeDelayMs);
    return `fake push ${targetRef}`;
  }

  async logout(registryHost) {
    await sleep(config.executor.fakeDelayMs);
    return `fake logout ${registryHost}`;
  }
}

module.exports = FakeExecutor;
