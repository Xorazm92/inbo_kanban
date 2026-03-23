-- Add role and manager_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id TEXT REFERENCES users(id);

-- Update RLS policies if necessary (optional)
-- The existing policies allow viewing and updating.
