export const securityConfig = () => ({
  security: {
    sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 86400),
    passwordHashAlgo: process.env.PASSWORD_HASH_ALGO ?? "pbkdf2_sha256",
    jwtSecretReservedOnly: process.env.JWT_SECRET,
    workerTokenSecret: process.env.WORKER_TOKEN_SECRET,
    registrySecretKey: process.env.REGISTRY_SECRET_KEY
  }
});
