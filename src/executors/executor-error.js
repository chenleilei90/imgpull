class ExecutorError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'ExecutorError';
    this.code = code;
    this.details = details;
  }
}

module.exports = ExecutorError;
