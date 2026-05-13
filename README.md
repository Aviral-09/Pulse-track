# Product Analysis System (Event-Based Analytics)

A production-grade, high-performance event analytics system inspired by Amplitude. Built with Node.js, Express, PostgreSQL (Supabase), and React.

## System Architecture

1. **Tracking SDK (Client)**: A lightweight JavaScript SDK that auto-captures context (UA, URL, IDs) and pushes events to the ingestion API.
2. **Event Ingestion API (Backend)**: Fast, non-blocking API that validates and persists raw events using strictly optimized SQL.
3. **Database (PostgreSQL)**: Scalable event storage with partial indexing for fast analytics queries.
4. **Analytics Engine**: Uses SQL CTEs and window functions to compute complex metrics like sequential funnels on-the-fly.
5. **Dashboard (Frontend)**: Real-time visualization of KPIs, event distribution, and conversion funnels.

## Event Flow

1. User interacts with the UI -> `analytics.track('event_name', { props })`.
2. SDK attaches `anonymous_id`, `page_url`, `user_agent`, and `timestamp`.
3. Event is POSTed to `/v1/track`.
4. Backend validates schema using **Zod**.
5. Event is inserted into the `events` table via raw SQL (Target ingestion time: <50ms).
6. Dashboard fetches aggregated data from `/v1/analytics/*`.

## Scaling & Limitations

- **Current Scaling**: Logically handles millions of events. The `idx_events_name_time` index allows fast filtering on high-volume datasets.
- **Bottlenecks**: 
  - Direct DB insertion might slow down at massive scale (>10k events/sec).
  - Funnel queries on billions of rows without materialization could become slow.
- **Production Upgrades**:
  - **Queueing**: Add Kafka or RabbitMQ between the API and DB to handle traffic spikes.
  - **Pre-aggregation**: Use TimescaleDB or Postgres Materialized Views for overnight aggregations.
  - **Identity Stitching**: Implement a background job to merge `anonymous_id` to `user_id` across historical events once a user logs in.
  - **ClickHouse**: For true "infinite" scale, migrate the `events` table to a columnar store like ClickHouse.

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Check `.env` (configure with your Supabase Transaction Pooler URL)
4. `node index.js`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Database Schema
The schema is designed for Supabase. You can find the production-ready schema definitions or apply the provided Supabase migration SQL. Tables include `users` and `events` optimized with composite indexes and GIN for JSONB properties.
