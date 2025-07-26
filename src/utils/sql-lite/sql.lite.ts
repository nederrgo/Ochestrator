import * as Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

/**
 * Initializes an SQLite database with a test_runs table
 * @param dbPath Optional custom path for the database file
 * @returns Database instance
 */
export function initializeSQLite(dbPath?: string): Database.Database {
    // Use provided path or default to 'data' directory in the project root
    const databasePath = dbPath || join(process.cwd(), 'data', 'test-results.db');

    // Ensure the directory exists
    const dirPath = join(databasePath, '..');
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }

    // Initialize the database
    const db = new Database(databasePath);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');

    // Create tables if they don't exist
    db.exec(`
    CREATE TABLE IF NOT EXISTS test_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id TEXT NOT NULL,
      test_name TEXT NOT NULL,
      test_search_name TEXT NOT NULL,
      status TEXT NOT NULL,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      result TEXT,
      error TEXT,
      duration_ms INTEGER,
      test_sequence TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_test_runs_test_id ON test_runs(test_id);
    CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
    CREATE INDEX IF NOT EXISTS idx_test_runs_timestamp ON test_runs(start_time);
  `);

    return db;
}

/**
 * Interface for test run data
 */
export interface TestRun {
    id?: number;
    test_id: string;
    test_name: string;
    test_search_name: string;
    status: 'pending' | 'running' | 'passed' | 'failed' | 'error' | string;
    start_time?: string | Date;
    end_time?: string | Date | null;
    result?: string | null;
    error?: string | null;
    duration_ms?: number | null;
    test_sequence?: string | null;
}

/**
 * Upserts a test run record in a transaction
 * @param db Database instance
 * @param data Test run data to upsert
 * @returns The inserted/updated test run ID
 */
export function upsertTestRun(db: Database.Database, data: TestRun): number {
    return db.transaction((data) => {
        // First try to update existing record
        const update = db.prepare(`
            UPDATE test_runs 
            SET 
                test_name = ?,
                test_search_name = ?,
                status = ?,
                end_time = ?,
                result = ?,
                error = ?,
                duration_ms = ?,
                test_sequence = ?
            WHERE test_id = ? AND test_name = ?
        `).run(
            data.test_name,
            data.test_search_name,
            data.status,
            data.end_time || null,
            data.result || null,
            data.error || null,
            data.duration_ms || null,
            data.test_sequence || null,
            data.test_id,
            data.test_name
        );

        // If no rows were updated, insert a new record
        if (update.changes === 0) {
            const insert = db.prepare(`
                INSERT INTO test_runs (
                    test_id,
                    test_name,
                    test_search_name,
                    status,
                    start_time,
                    end_time,
                    result,
                    error,
                    duration_ms,
                    test_sequence
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                data.test_id,
                data.test_name,
                data.test_search_name,
                data.status,
                data.start_time || new Date().toISOString(),
                data.end_time || null,
                data.result || null,
                data.error || null,
                data.duration_ms || null,
                data.test_sequence || null
            );
            return insert.lastInsertRowid as number;
        }

        // If we updated, return the existing ID
        const row = db.prepare('SELECT id FROM test_runs WHERE test_id = ?').get(data.test_id) as { id: number };
        return row.id;
    })(data);
}

/**
 * Retrieves all test runs for a specific test ID
 * @param db Database instance
 * @param testId The test ID to search for
 * @returns Array of TestRun objects matching the test ID
 */
export function getTestRunsById(db: Database.Database, testId: string): TestRun[] {
  const stmt = db.prepare(`
    SELECT * FROM test_runs 
    WHERE test_id = ?
    ORDER BY start_time DESC
  `);
  
  return stmt.all(testId) as TestRun[];
}
export function getTestRunsByIdAndTestSearchName(db: Database.Database, testId: string, testSearchName: string): TestRun {
    const stmt = db.prepare(`
      SELECT * FROM test_runs 
      WHERE test_id = ? AND test_name = ?
      ORDER BY start_time DESC
    `);
    
    return stmt.all(testId, testSearchName)[0] as TestRun;
  }

// Example usage:
// const db = initializeSQLite();
// const testRunId = upsertTestRun(db, {
//     test_id: 'test-123',
//     test_name: 'Login Test',
//     status: 'running'
// });
// db.close(); // Don't forget to close the connection when done