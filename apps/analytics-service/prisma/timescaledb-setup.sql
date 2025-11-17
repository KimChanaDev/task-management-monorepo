-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert task_events to hypertable (time-series optimized table)
-- This will be run after Prisma migration
-- Run manually: SELECT create_hypertable('task_events', 'timestamp', if_not_exists => TRUE);

-- Create continuous aggregates for better query performance
-- These will be created after the tables are set up

-- Continuous aggregate for hourly task metrics
-- CREATE MATERIALIZED VIEW task_metrics_hourly
-- WITH (timescaledb.continuous) AS
-- SELECT
--   time_bucket('1 hour', timestamp) AS bucket,
--   COUNT(*) as total_events,
--   COUNT(*) FILTER (WHERE event_type = 'CREATED') as created_count,
--   COUNT(*) FILTER (WHERE event_type = 'COMPLETED') as completed_count,
--   COUNT(*) FILTER (WHERE event_type = 'UPDATED') as updated_count
-- FROM task_events
-- GROUP BY bucket;

-- Continuous aggregate for daily user productivity
-- CREATE MATERIALIZED VIEW user_productivity_daily
-- WITH (timescaledb.continuous) AS
-- SELECT
--   time_bucket('1 day', timestamp) AS bucket,
--   user_id,
--   COUNT(*) FILTER (WHERE event_type = 'CREATED') as tasks_created,
--   COUNT(*) FILTER (WHERE event_type = 'COMPLETED') as tasks_completed
-- FROM task_events
-- GROUP BY bucket, user_id;

-- Add retention policy (optional - keep data for 90 days)
-- SELECT add_retention_policy('task_events', INTERVAL '90 days');
