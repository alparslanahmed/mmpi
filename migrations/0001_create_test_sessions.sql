CREATE TABLE IF NOT EXISTS test_sessions (
  id TEXT PRIMARY KEY,
  participant_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
  current_index INTEGER NOT NULL DEFAULT 0,
  answers_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_test_sessions_updated_at
  ON test_sessions(updated_at DESC);
