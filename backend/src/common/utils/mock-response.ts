export interface ApiEnvelope<T> {
  success: true;
  data: T;
  requestId: string;
}

export function ok<T>(data: T): ApiEnvelope<T> {
  return {
    success: true,
    data,
    requestId: "req_mock_backend_baseline"
  };
}

export function todo(message: string) {
  return ok({
    implemented: false,
    message
  });
}
