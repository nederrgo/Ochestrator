import type { Database } from 'better-sqlite3';
import { getTestRunsById } from "./sql-lite/sql.lite";
/**
 * Checks if all test runs for a specific test ID are in a final state (passed, error, or failed)
 * @param db Database instance
 * @param testId The test ID to check
 * @returns Promise<boolean> - True if all test runs are in a final state, false otherwise
 */
export async function areAllTestRunsComplete(db: Database, testId: string): Promise<boolean> {
    try {
        // Get all test runs for the given test ID
        const testRuns = getTestRunsById(db, testId);

        // If no test runs found, return false  
        if (testRuns.length === 0) return false;

        // Check if all test runs are in a final state
        return testRuns.every(run =>
            ['passed', 'error', 'failed'].includes(run.status.toLowerCase())
        );
    } catch (error) {
        console.error('Error checking test run statuses:', error);
        return false;
    }
}
