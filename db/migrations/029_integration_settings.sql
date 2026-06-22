-- Migration 029: Add integration_settings JSONB column to offers table.
-- Stores tracking platform selection and token mapping for the Smart Integration helper.
-- Purely metadata — has no effect on click tracking, conversion, or postback processing.

ALTER TABLE offers ADD COLUMN IF NOT EXISTS integration_settings JSONB NULL DEFAULT NULL;
