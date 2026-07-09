import { normalizeHttpUrl, UnsafeUrlError } from '@statpulse/url-safety';
import { AppError } from '../../shared/errors/app-error';

const MIN_INTERVAL_SECONDS = 30;
const DEFAULT_INTERVAL_SECONDS = 60;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 30000;
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_EXPECTED_STATUS = 200;
const DEFAULT_METRICS_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_METRICS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_BUCKET_SECONDS = 60;
const MAX_BUCKET_SECONDS = 24 * 60 * 60;
const DEFAULT_BUCKET_SECONDS = 300;

export function normalizeUrl(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError('URL is required');
  }

  try {
    return normalizeHttpUrl(value);
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      throw new AppError(error.message);
    }

    throw error;
  }
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

export function normalizeName(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new AppError('name must be a string');
  }

  const name = value.trim();

  if (name.length === 0) {
    return undefined;
  }

  if (name.length > 120) {
    throw new AppError('name must be 120 characters or less');
  }

  return name;
}

export function normalizeHttpMethod(value: unknown) {
  if (value === undefined) {
    return 'GET';
  }

  if (value !== 'GET' && value !== 'HEAD') {
    throw new AppError('method must be GET or HEAD');
  }

  return value;
}

export function normalizeExpectedStatus(value: unknown) {
  if (value === undefined) {
    return DEFAULT_EXPECTED_STATUS;
  }

  const expectedStatus = Number(value);

  if (!Number.isInteger(expectedStatus) || expectedStatus < 100 || expectedStatus > 599) {
    throw new AppError('expectedStatus must be a valid HTTP status code');
  }

  return expectedStatus;
}

export function normalizeTimeoutMs(value: unknown) {
  if (value === undefined) {
    return DEFAULT_TIMEOUT_MS;
  }

  const timeoutMs = Number(value);

  if (!Number.isInteger(timeoutMs) || timeoutMs < MIN_TIMEOUT_MS || timeoutMs > MAX_TIMEOUT_MS) {
    throw new AppError(`timeoutMs must be between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}`);
  }

  return timeoutMs;
}

export function normalizeResultsLimit(value: unknown) {
  const limit = Number(value || 50);

  if (!Number.isFinite(limit) || limit <= 0) {
    return 50;
  }

  return Math.min(limit, 200);
}

export function normalizeMetricsQuery(input: { from: unknown; to: unknown; bucketSeconds: unknown }) {
  const to = normalizeMetricsDate(input.to, new Date());
  const from = normalizeMetricsDate(input.from, new Date(to.getTime() - DEFAULT_METRICS_WINDOW_MS));
  const bucketSeconds = normalizeBucketSeconds(input.bucketSeconds);

  if (from >= to) {
    throw new AppError('from must be before to');
  }

  if (to.getTime() - from.getTime() > MAX_METRICS_WINDOW_MS) {
    throw new AppError('metrics range must be 30 days or less');
  }

  return {
    from,
    to,
    bucketSeconds,
  };
}

function normalizeMetricsDate(value: unknown, fallback: Date) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'string') {
    throw new AppError('metrics dates must be ISO strings');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError('metrics dates must be valid ISO strings');
  }

  return date;
}

function normalizeBucketSeconds(value: unknown) {
  if (value === undefined) {
    return DEFAULT_BUCKET_SECONDS;
  }

  const bucketSeconds = Number(value);

  if (!Number.isInteger(bucketSeconds) || bucketSeconds < MIN_BUCKET_SECONDS || bucketSeconds > MAX_BUCKET_SECONDS) {
    throw new AppError(`bucketSeconds must be between ${MIN_BUCKET_SECONDS} and ${MAX_BUCKET_SECONDS}`);
  }

  return bucketSeconds;
}
