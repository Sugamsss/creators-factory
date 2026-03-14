-- Migration: Add visual_versions and reference_slots tables
-- Run this migration manually

-- Create visual_versions table
CREATE TABLE IF NOT EXISTS visual_versions (
    id SERIAL PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    image_url VARCHAR NOT NULL,
    fal_request_id VARCHAR,
    prompt TEXT NOT NULL,
    enhanced_prompt TEXT,
    model_used VARCHAR NOT NULL,
    aspect_ratio VARCHAR NOT NULL,
    quality VARCHAR NOT NULL,
    is_edit BOOLEAN DEFAULT FALSE,
    mask_image_url VARCHAR,
    edit_source_url VARCHAR,
    is_active_base BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(avatar_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_visual_versions_avatar_id ON visual_versions(avatar_id);
CREATE INDEX IF NOT EXISTS idx_visual_versions_active_base ON visual_versions(avatar_id, is_active_base);

-- Create reference_slots table
CREATE TABLE IF NOT EXISTS reference_slots (
    id SERIAL PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    slot_key VARCHAR NOT NULL,
    slot_label VARCHAR NOT NULL,
    image_url VARCHAR NOT NULL,
    fal_request_id VARCHAR,
    prompt TEXT NOT NULL,
    aspect_ratio VARCHAR,
    is_refined BOOLEAN DEFAULT FALSE,
    refinement_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(avatar_id, slot_key)
);

CREATE INDEX IF NOT EXISTS idx_reference_slots_avatar_id ON reference_slots(avatar_id);
