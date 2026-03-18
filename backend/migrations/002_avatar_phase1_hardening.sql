-- Avatar Phase 1 hardening migration
-- Contracts version: avatars-phase1-v2

BEGIN;

-- Durable avatar event stream for SSE replay and restart safety.
CREATE TABLE IF NOT EXISTS avatar_events (
    id BIGSERIAL PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    event_type VARCHAR(120) NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avatar_events_avatar_id ON avatar_events(avatar_id);
CREATE INDEX IF NOT EXISTS idx_avatar_events_created_at ON avatar_events(created_at DESC);

-- Enforce uniqueness for visual/reference sequences.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_visual_avatar_version'
    ) THEN
        ALTER TABLE visual_versions
        ADD CONSTRAINT uq_visual_avatar_version UNIQUE (avatar_id, version_number);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_reference_slot_avatar_key'
    ) THEN
        ALTER TABLE reference_slots
        ADD CONSTRAINT uq_reference_slot_avatar_key UNIQUE (avatar_id, slot_key);
    END IF;
END $$;

-- Exactly one active base is allowed per avatar.
CREATE UNIQUE INDEX IF NOT EXISTS uq_visual_active_base_per_avatar
    ON visual_versions(avatar_id)
    WHERE is_active_base = TRUE;

-- Normalize legacy ownership values and enforce canonical values.
UPDATE avatars SET ownership_scope = 'personal' WHERE ownership_scope = 'public' OR ownership_scope IS NULL;
ALTER TABLE avatars DROP CONSTRAINT IF EXISTS ck_avatars_ownership_scope;
ALTER TABLE avatars ADD CONSTRAINT ck_avatars_ownership_scope CHECK (ownership_scope IN ('personal', 'org'));

-- Normalize legacy source_type and enforce canonical values.
UPDATE avatars SET source_type = 'original' WHERE source_type IS NULL;
ALTER TABLE avatars DROP CONSTRAINT IF EXISTS ck_avatars_source_type;
ALTER TABLE avatars ADD CONSTRAINT ck_avatars_source_type CHECK (source_type IN ('original', 'clone'));

-- Repair active_card_image_url based on active visual version (single source of truth).
WITH active_versions AS (
    SELECT avatar_id, image_url
    FROM visual_versions
    WHERE is_active_base = TRUE
)
UPDATE avatars a
SET active_card_image_url = av.image_url
FROM active_versions av
WHERE a.id = av.avatar_id;

COMMIT;
