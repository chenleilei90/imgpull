const AppError = require('./app-error');

function normalizeDockerHubOfficialImage(input) {
  const raw = String(input || '').trim();
  if (!raw) {
    throw new AppError(400, 40031, '镜像输入不能为空');
  }

  let working = raw;
  let tag = 'latest';

  const atIndex = working.indexOf('@');
  if (atIndex !== -1) {
    throw new AppError(400, 40032, '首发版本暂不支持 digest 形式镜像');
  }

  const lastColon = working.lastIndexOf(':');
  const lastSlash = working.lastIndexOf('/');
  if (lastColon > lastSlash) {
    tag = working.slice(lastColon + 1);
    working = working.slice(0, lastColon);
  }

  if (working.startsWith('docker.io/')) {
    working = working.slice('docker.io/'.length);
  }

  if (working.startsWith('library/')) {
    working = working.slice('library/'.length);
  }

  if (working.includes('/')) {
    throw new AppError(400, 40033, '首发版本仅支持 DockerHub 官方公开镜像');
  }

  if (!working) {
    throw new AppError(400, 40034, '镜像名称不合法');
  }

  return {
    sourceInput: raw,
    sourceRegistry: 'docker.io',
    sourceNamespace: 'library',
    sourceRepo: working,
    sourceTag: tag || 'latest',
    resolvedSourceRef: `docker.io/library/${working}:${tag || 'latest'}`,
    targetRepo: working,
    targetTag: tag || 'latest'
  };
}

module.exports = {
  normalizeDockerHubOfficialImage
};
