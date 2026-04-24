const { config } = require('../config');
const DockerExecutor = require('./docker.executor');
const FakeExecutor = require('./fake.executor');

let cachedExecutor = null;

function buildExecutor() {
  switch (String(config.executor.driver || 'docker').toLowerCase()) {
    case 'fake':
      return new FakeExecutor();
    case 'docker':
    default:
      return new DockerExecutor();
  }
}

function getExecutor() {
  if (!cachedExecutor) {
    cachedExecutor = buildExecutor();
  }
  return cachedExecutor;
}

module.exports = {
  getExecutor
};
