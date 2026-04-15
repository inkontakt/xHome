-- Supabase Database Schema Migrations
-- Run these in Supabase SQL Editor: https://supabase.com/dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Posts Analytics Table
CREATE TABLE IF NOT EXISTS posts_analytics (
  id BIGSERIAL PRIMARY KEY,
  wordpress_post_id INT UNIQUE NOT NULL,
  views INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Comments Table
CREATE TABLE IF NOT EXISTS user_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  wordpress_post_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 5. User Interactions Table (views, saves, likes)
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  wordpress_post_id INT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'save', 'like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_comments_post ON user_comments(wordpress_post_id);
CREATE INDEX IF NOT EXISTS idx_user_comments_user ON user_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_post ON user_interactions(wordpress_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_analytics_post ON posts_analytics(wordpress_post_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- User Profiles - Users can only read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Posts Analytics - Public read access
CREATE POLICY "Analytics are public" ON posts_analytics
  FOR SELECT
  USING (true);

-- User Comments - Public read, authenticated users can insert
CREATE POLICY "Comments are public" ON user_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comments" ON user_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON user_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON user_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Newsletter Subscribers - Service role only
CREATE POLICY "Service role manages subscribers" ON newsletter_subscribers
  USING (false)
  WITH CHECK (false);

-- User Interactions - Users can read/write their own
CREATE POLICY "Users can view own interactions" ON user_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON user_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_id INT)
RETURNS void
AS $$
BEGIN
  INSERT INTO posts_analytics (wordpress_post_id, views)
  VALUES (post_id, 1)
  ON CONFLICT (wordpress_post_id)
  DO UPDATE SET
    views = posts_analytics.views + 1,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts_analytics
    SET
      comments_count = comments_count + 1,
      last_updated = NOW()
    WHERE wordpress_post_id = NEW.wordpress_post_id;
    
    INSERT INTO posts_analytics (wordpress_post_id, comments_count)
    VALUES (NEW.wordpress_post_id, 1)
    ON CONFLICT (wordpress_post_id) DO NOTHING;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts_analytics
    SET
      comments_count = GREATEST(comments_count - 1, 0),
      last_updated = NOW()
    WHERE wordpress_post_id = OLD.wordpress_post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update comment count on insert/delete
CREATE TRIGGER update_comment_count_trigger
AFTER INSERT OR DELETE ON user_comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comment_count();

-- ============================================================
-- STORAGE SETUP
-- ============================================================

-- Create storage buckets (run in Supabase console):
-- 1. Create "blog-images" bucket (public)
-- 2. Create "user-uploads" bucket (private)
-- 3. Create "tenant-logos" bucket (public uploads for configurator)
-- 4. Create "talent-logos" bucket (public uploads for configurator)
--
-- Add to bucket policies (in Supabase console):
--
-- For blog-images (public):
-- INSERT: Allow authenticated users
-- UPDATE: Allow only own files
-- DELETE: Allow only own files
-- SELECT: Allow public access
--
-- For user-uploads (private):
-- INSERT: Allow authenticated users
-- UPDATE: Allow only own files
-- DELETE: Allow only own files
-- SELECT: Allow authenticated users

-- For tenant-logos (public uploads):
-- INSERT: Allow public uploads
-- SELECT: Allow public access
--
-- For talent-logos (public uploads):
-- INSERT: Allow authenticated users to upload
-- UPDATE: Allow only own files
-- DELETE: Allow only own files
-- SELECT: Allow public access

-- Storage policies for tenant-logos
CREATE POLICY "Public insert tenant logos" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'tenant-logos');

CREATE POLICY "Public read tenant logos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'tenant-logos');

-- Storage policies for talent-logos
CREATE POLICY "Authenticated insert talent logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'talent-logos' AND auth.uid() = owner);

CREATE POLICY "Public read talent logos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'talent-logos');

CREATE POLICY "Users update own talent logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'talent-logos' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'talent-logos' AND auth.uid() = owner);

CREATE POLICY "Users delete own talent logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'talent-logos' AND auth.uid() = owner);

-- ============================================================
-- INITIAL DATA (Optional)
-- ============================================================

-- Note: Only run if needed. This creates initial analytics records.
-- Replace 1, 2, 3 with actual WordPress post IDs
/*
INSERT INTO posts_analytics (wordpress_post_id, views, comments_count)
VALUES 
  (1, 0, 0),
  (2, 0, 0),
  (3, 0, 0)
ON CONFLICT DO NOTHING;
*/
