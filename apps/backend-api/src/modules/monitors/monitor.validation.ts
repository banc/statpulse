import { AppError } from '../../shared/errors/app-error';

const MIN_INTERVAL_SECONDS = 30;
const DEFAULT_INTERVAL_SECONDS = 60;

export function normalizeUrl(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError('URL is required');
  }

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new AppError('URL must be valid');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new AppError('Only HTTP and HTTPS URLs are supported for MVP');
  }

  return url.toString();
}

export function normalizeIntervalSeconds(value: unknown) {
  if (value === undefined) {
    return DEFAULT_INTERVAL_SECONDS;
  }

  const intervalSeconds = Number(value);

  if (!Number.isInteger(intervalSeconds) || intervalSeconds < MIN_INTERVAL_SECONDS) {
    throw new AppError(`intervalSeconds must be at least ${MIN_INTERVAL_SECONDS}`);
  }

  return intervalSeconds;
}

export function normalizeResultsLimit(value: unknown) {
  const limit = Number(value || 50);

  if (!Number.isFinite(limit) || limit <= 0) {
    return 50;
  }

  return Math.min(limit, 200);
}
