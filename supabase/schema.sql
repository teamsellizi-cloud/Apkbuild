-- ========================================================
-- devs APK Builder - Supabase Postgres Schema & RLS
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    github_token TEXT,
    github_repo TEXT,
    github_branch TEXT DEFAULT 'main',
    github_workflow TEXT DEFAULT 'apk-builder.yml',
    runner_mode TEXT DEFAULT 'auto',
    keystore_alias TEXT DEFAULT 'apkbuilder-release-key',
    keystore_fingerprint TEXT,
    keystore_configured BOOLEAN DEFAULT false,
    retention_days INTEGER DEFAULT 14,
    callback_secret TEXT DEFAULT 'sec_' || substr(md5(random()::text), 1, 16),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Builds Table
CREATE TABLE IF NOT EXISTS public.builds (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    app_name TEXT NOT NULL,
    package_id TEXT NOT NULL,
    version_name TEXT DEFAULT '1.0.0' NOT NULL,
    version_code INTEGER DEFAULT 1 NOT NULL,
    build_type TEXT NOT NULL CHECK (build_type IN ('website', 'zip', 'pwa')),
    source_url TEXT,
    zip_file_name TEXT,
    zip_file_size INTEGER,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'validating', 'preparing', 'building', 'signing', 'completed', 'failed', 'cancelled')),
    progress_percent INTEGER DEFAULT 0 NOT NULL,
    current_step TEXT,
    error_message TEXT,
    app_icon_url TEXT,
    config_json JSONB NOT NULL,
    manifest_json JSONB,
    logs TEXT DEFAULT '' NOT NULL,
    github_run_id TEXT,
    github_run_url TEXT,
    apk_file_name TEXT,
    apk_file_size INTEGER,
    apk_data TEXT,
    retry_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- Row Level Security (RLS) Policies
-- ========================================================

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;

-- Policy: Single-User Access to App Settings (Authenticated users only)
CREATE POLICY "Allow authenticated owner all actions on app_settings"
    ON public.app_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Builds table access (Authenticated users only can see/manage their builds)
CREATE POLICY "Users can view their own builds"
    ON public.builds
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own builds"
    ON public.builds
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own builds"
    ON public.builds
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own builds"
    ON public.builds
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- ========================================================
-- Supabase Storage Buckets & Policies
-- ========================================================

-- Insert private buckets for uploaded ZIP sources and generated APK artifacts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('apk-artifacts', 'apk-artifacts', false, 104857600, ARRAY['application/vnd.android.package-archive', 'application/zip']),
    ('zip-sources', 'zip-sources', false, 52428800, ARRAY['application/zip', 'application/x-zip-compressed'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Restrict APK and ZIP storage access to authenticated user
CREATE POLICY "Private APK access for owner"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id IN ('apk-artifacts', 'zip-sources'))
    WITH CHECK (bucket_id IN ('apk-artifacts', 'zip-sources'));

-- Retention Auto-Cleanup Helper Function (Deletes builds older than retention_days)
CREATE OR REPLACE FUNCTION public.cleanup_expired_build_artifacts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH target_builds AS (
        SELECT id FROM public.builds
        WHERE created_at < NOW() - INTERVAL '14 days'
    )
    DELETE FROM public.builds
    WHERE id IN (SELECT id FROM target_builds);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
