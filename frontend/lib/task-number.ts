export function normalizeTaskNo(input: string) {
  return input.replace(/[-\s]/g, "").toUpperCase();
}

export function matchesTaskNo(query: string, taskNo?: string, taskNoNormalized?: string) {
  const normalizedQuery = normalizeTaskNo(query);
  if (!normalizedQuery) return true;

  const normalizedTaskNo = taskNoNormalized || normalizeTaskNo(taskNo ?? "");
  const withoutPrefix = normalizedTaskNo.startsWith("IMG") ? normalizedTaskNo.slice(3) : normalizedTaskNo;

  return normalizedTaskNo.includes(normalizedQuery) || withoutPrefix.includes(normalizedQuery);
}

export function matchesBusinessNo(query: string, value?: string) {
  const normalizedQuery = normalizeTaskNo(query);
  if (!normalizedQuery) return true;

  const normalizedValue = normalizeTaskNo(value ?? "");
  const withoutTaskPrefix = normalizedValue.startsWith("IMG") ? normalizedValue.slice(3) : normalizedValue;
  const withoutBatchPrefix = normalizedValue.startsWith("BAT") ? normalizedValue.slice(3) : normalizedValue;

  return (
    normalizedValue.includes(normalizedQuery) ||
    withoutTaskPrefix.includes(normalizedQuery) ||
    withoutBatchPrefix.includes(normalizedQuery)
  );
}
