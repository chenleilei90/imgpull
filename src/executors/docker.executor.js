const { spawnSync } = require('child_process');
const { config } = require('../config');
const ExecutorError = require('./executor-error');

function runDocker(args, timeoutMs) {
  const result = spawnSync(config.executor.dockerBinary, args, {
    encoding: 'utf8',
    windowsHide: true,
    timeout: timeoutMs
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      throw new ExecutorError(
        'docker_not_found',
        `docker binary not found: ${config.executor.dockerBinary}`,
        { args }
      );
    }

    throw new ExecutorError(
      'runtime_unavailable',
      String(result.error.message || result.error),
      { args }
    );
  }

  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new ExecutorError(
      'docker_command_failed',
      detail || `docker ${args.join(' ')} failed`,
      { args, status: result.status }
    );
  }

  return result.stdout || '';
}

class DockerExecutor {
  getDriverName() {
    return 'docker';
  }

  async testRegistryConnection({ registryHost, username, secret }) {
    runDocker(['login', registryHost, '-u', username, '-p', secret], 45000);
    runDocker(['logout', registryHost], 15000);
    return {
      code: 'ok',
      message: 'docker login/logout succeeded'
    };
  }

  async pull(sourceRef) {
    runDocker(['pull', sourceRef], config.executor.pullTimeoutMs);
    return `docker pull ${sourceRef}`;
  }

  async tag(sourceRef, targetRef) {
    runDocker(['tag', sourceRef, targetRef], 60000);
    return `docker tag ${sourceRef} ${targetRef}`;
  }

  async login(registryHost, username, secret) {
    runDocker(['login', registryHost, '-u', username, '-p', secret], 45000);
    return `docker login ${registryHost} -u ${username}`;
  }

  async push(targetRef) {
    runDocker(['push', targetRef], config.executor.pushTimeoutMs);
    return `docker push ${targetRef}`;
  }

  async logout(registryHost) {
    runDocker(['logout', registryHost], 15000);
    return `docker logout ${registryHost}`;
  }
}

module.exports = DockerExecutor;
