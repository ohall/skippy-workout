import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

function resolvePath(p) {
  if (p.startsWith('~')) return path.join(os.homedir(), p.slice(1));
  return p;
}

export function initDb(dbPath = 'gym_progress.sqlite') {
  dbPath = resolvePath(dbPath);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_date TEXT NOT NULL,
      cycle_day INTEGER NOT NULL,
      workout_name TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      duration_minutes INTEGER,
      soreness_1_10 INTEGER,
      energy_1_10 INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS exercise_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      target_reps_low INTEGER,
      target_reps_high INTEGER,
      actual_reps INTEGER,
      weight_lbs REAL,
      rpe REAL,
      rir REAL,
      notes TEXT,
      FOREIGN KEY(session_id) REFERENCES workout_sessions(id)
    );
    CREATE TABLE IF NOT EXISTS exercise_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_name TEXT NOT NULL UNIQUE,
      last_weight_lbs REAL,
      last_successful_reps INTEGER,
      next_recommended_weight_lbs REAL,
      progression_note TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

export function getTodaysSession(db, date) {
  return db.prepare(
    'SELECT * FROM workout_sessions WHERE workout_date = ? AND workout_name = ? ORDER BY id DESC LIMIT 1'
  ).get(date, date.cycleDay !== undefined ? null : null);
}

export function getSessionByDateAndName(db, dateStr, workoutName) {
  return db.prepare(
    'SELECT * FROM workout_sessions WHERE workout_date = ? AND workout_name = ? ORDER BY id DESC LIMIT 1'
  ).get(dateStr, workoutName);
}

export function createSession(db, { date, cycleDay, workoutName, notes }) {
  const existing = db.prepare(
    'SELECT * FROM workout_sessions WHERE workout_date = ? AND workout_name = ? LIMIT 1'
  ).get(date, workoutName);

  // If already completed, return existing
  if (existing && existing.completed) {
    return existing;
  }

  // If exists but not completed, reuse
  if (existing) {
    return existing;
  }

  const stmt = db.prepare(
    'INSERT INTO workout_sessions (workout_date, cycle_day, workout_name, completed, notes) VALUES (?, ?, ?, 0, ?)'
  );
  const info = stmt.run(date, cycleDay, workoutName, notes || 'Workout job started');
  return db.prepare('SELECT * FROM workout_sessions WHERE id = ?').get(info.lastInsertRowid);
}

export function saveSets(db, sessionId, sets) {
  const stmt = db.prepare(
    `INSERT INTO exercise_sets (session_id, exercise_name, set_number, target_reps_low, target_reps_high, actual_reps, weight_lbs, rpe, rir)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertMany = db.transaction((sets) => {
    for (const s of sets) {
      stmt.run(sessionId, s.exercise_name, s.set_number, s.target_reps_low ?? null,
        s.target_reps_high ?? null, s.actual_reps, s.weight_lbs, s.rpe ?? null, s.rir ?? null);
    }
  });
  insertMany(sets);
}

export function markSessionCompleted(db, sessionId, notes) {
  db.prepare('UPDATE workout_sessions SET completed = 1, notes = ? WHERE id = ?').run(notes, sessionId);
}

export function getRecommendations(db) {
  return db.prepare('SELECT * FROM exercise_recommendations ORDER BY exercise_name').all();
}

export function updateRecommendations(db, recs) {
  const stmt = db.prepare(`
    INSERT INTO exercise_recommendations (exercise_name, last_weight_lbs, last_successful_reps, next_recommended_weight_lbs, progression_note)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(exercise_name) DO UPDATE SET
      last_weight_lbs = excluded.last_weight_lbs,
      last_successful_reps = excluded.last_successful_reps,
      next_recommended_weight_lbs = excluded.next_recommended_weight_lbs,
      progression_note = excluded.progression_note,
      updated_at = CURRENT_TIMESTAMP
  `);
  const updateMany = db.transaction((recs) => {
    for (const r of recs) {
      stmt.run(r.exercise_name, r.last_weight_lbs, r.last_successful_reps,
        r.next_recommended_weight_lbs, r.progression_note);
    }
  });
  updateMany(recs);
}

export function getRecentPerformance(db, workoutName) {
  const session = db.prepare(
    'SELECT * FROM workout_sessions WHERE workout_name = ? AND completed = 1 ORDER BY workout_date DESC, id DESC LIMIT 1'
  ).get(workoutName);
  if (!session) return null;
  const sets = db.prepare(
    'SELECT * FROM exercise_sets WHERE session_id = ? ORDER BY set_number ASC, id ASC'
  ).all(session.id);
  return { session, sets };
}

export function closeDb(db) {
  db.close();
}