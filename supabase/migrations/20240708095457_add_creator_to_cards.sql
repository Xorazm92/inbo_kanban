-- Add user_id (creator) to cards table
ALTER TABLE cards ADD COLUMN user_id TEXT REFERENCES users(id);

-- Update existing cards to have board creator as card creator (best effort)
UPDATE cards c
SET user_id = b.creator
FROM boards b
WHERE c.board_id = b.id;

-- Make user_id NOT NULL for future cards (optional, but good for consistency)
-- ALTER TABLE cards ALTER COLUMN user_id SET NOT NULL;
