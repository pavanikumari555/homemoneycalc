CREATE TABLE IF NOT EXISTS community_questions (
  url TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  context TEXT NOT NULL,
  tool TEXT NOT NULL,
  answer TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('needs_context', 'review', 'approved', 'skipped')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
