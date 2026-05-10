export function nowIso() {
  return new Date().toISOString();
}

export function isRecentIsoDate(value: string, days = 14) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  const maxAgeMs = days * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp <= maxAgeMs;
}
