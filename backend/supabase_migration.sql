-- Supabase Migration: Schema & Indexing

-- 1. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    public_key TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    plan_type TEXT DEFAULT 'free',
    usage_limit_events INTEGER DEFAULT 10000,
    retention_days INTEGER DEFAULT 30,
    product_type TEXT DEFAULT 'custom',
    enabled_modules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    anonymous_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS identity_merges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(anonymous_id, user_id, project_id)
);

CREATE TABLE IF NOT EXISTS cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    anonymous_id TEXT NOT NULL,
    user_id UUID,
    properties JSONB,
    page_url TEXT,
    user_agent TEXT,
    event_version TEXT,
    sdk_version TEXT,
    environment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure Indexing Strategy Remains Optimized
-- High-performance indexes for ingestion and analytics queries
CREATE INDEX IF NOT EXISTS idx_events_project_id_created_at ON events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_project_id_event_name_created_at ON events(project_id, event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_anonymous_id ON events(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_identity_merges_anonymous_id ON identity_merges(anonymous_id, project_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_project_id ON cohorts(project_id);

-- Optional: GIN index for JSONB properties if segmentation heavily filters on properties
CREATE INDEX IF NOT EXISTS idx_events_properties_gin ON events USING GIN (properties);
