-- Enable TimescaleDB for monitor result time-series storage.
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Timescale hypertables require unique indexes to include the partitioning column.
ALTER TABLE "MonitorResult" DROP CONSTRAINT IF EXISTS "MonitorResult_pkey";
ALTER TABLE "MonitorResult" ADD CONSTRAINT "MonitorResult_pkey" PRIMARY KEY ("id", "createdAt");

SELECT create_hypertable('"MonitorResult"', by_range('createdAt'), if_not_exists => TRUE);

-- Keep raw checks for 90 days. Future dashboard queries use aggregates for older ranges.
SELECT add_retention_policy('"MonitorResult"', INTERVAL '90 days', if_not_exists => TRUE);

CREATE MATERIALIZED VIEW IF NOT EXISTS "MonitorResultFiveMinuteMetrics"
WITH (timescaledb.continuous) AS
SELECT
  "monitorId",
  time_bucket(INTERVAL '5 minutes', "createdAt") AS "bucketStart",
  COUNT(*)::INTEGER AS "checkCount",
  AVG("responseTimeMs")::DOUBLE PRECISION AS "avgResponseTimeMs",
  MIN("responseTimeMs")::INTEGER AS "minResponseTimeMs",
  MAX("responseTimeMs")::INTEGER AS "maxResponseTimeMs",
  AVG(CASE WHEN "isUp" THEN 1.0 ELSE 0.0 END)::DOUBLE PRECISION AS "availability"
FROM "MonitorResult"
GROUP BY "monitorId", "bucketStart"
WITH NO DATA;

CREATE INDEX IF NOT EXISTS "MonitorResultFiveMinuteMetrics_monitor_bucket_idx"
ON "MonitorResultFiveMinuteMetrics" ("monitorId", "bucketStart" DESC);

SELECT add_continuous_aggregate_policy(
  '"MonitorResultFiveMinuteMetrics"',
  start_offset => INTERVAL '90 days',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '5 minutes',
  if_not_exists => TRUE
);
