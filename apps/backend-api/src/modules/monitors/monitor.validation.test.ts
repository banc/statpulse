import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../shared/errors/app-error';
import { normalizeMetricsQuery } from './monitor.validation';

describe('normalizeMetricsQuery', () => {
  it('uses a 24-hour default window and 5-minute buckets', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-09T12:00:00.000Z'));

    try {
      expect(normalizeMetricsQuery({ from: undefined, to: undefined, bucketSeconds: undefined })).toEqual({
        from: new Date('2026-07-08T12:00:00.000Z'),
        to: new Date('2026-07-09T12:00:00.000Z'),
        bucketSeconds: 300,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('accepts explicit ISO dates and bucketSeconds', () => {
    expect(
      normalizeMetricsQuery({
        from: '2026-07-09T10:00:00.000Z',
        to: '2026-07-09T12:00:00.000Z',
        bucketSeconds: '600',
      }),
    ).toEqual({
      from: new Date('2026-07-09T10:00:00.000Z'),
      to: new Date('2026-07-09T12:00:00.000Z'),
      bucketSeconds: 600,
    });
  });

  it('rejects invalid dates', () => {
    expect(() =>
      normalizeMetricsQuery({
        from: 'not-a-date',
        to: '2026-07-09T12:00:00.000Z',
        bucketSeconds: 300,
      }),
    ).toThrow(AppError);
  });

  it('rejects inverted ranges', () => {
    expect(() =>
      normalizeMetricsQuery({
        from: '2026-07-09T12:00:00.000Z',
        to: '2026-07-09T10:00:00.000Z',
        bucketSeconds: 300,
      }),
    ).toThrow('from must be before to');
  });

  it('rejects ranges longer than 30 days', () => {
    expect(() =>
      normalizeMetricsQuery({
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-07-09T00:00:00.000Z',
        bucketSeconds: 300,
      }),
    ).toThrow('metrics range must be 30 days or less');
  });

  it.each([59, 86401])('rejects bucketSeconds outside supported bounds: %s', (bucketSeconds) => {
    expect(() =>
      normalizeMetricsQuery({
        from: '2026-07-09T10:00:00.000Z',
        to: '2026-07-09T12:00:00.000Z',
        bucketSeconds,
      }),
    ).toThrow('bucketSeconds must be between 60 and 86400');
  });
});
