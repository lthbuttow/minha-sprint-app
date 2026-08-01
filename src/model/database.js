const Database = require('better-sqlite3');

const database = new Database(':memory:');
database.pragma('foreign_keys = ON');

database.exec(`
  CREATE TABLE sprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    general_notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE sprint_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
    UNIQUE(sprint_id, date)
  );

  CREATE TABLE attention_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    resolved INTEGER NOT NULL DEFAULT 0,
    resolution TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE
  );
`);

module.exports = database;
