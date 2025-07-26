import type { Database } from 'better-sqlite3';
import { getTestRunsById } from "./sql-lite/sql.lite";
import { TestResult } from '../types/test.resualt.type';
import { TestsNames } from '../types/testsNames';

/**
 * Fetches all test runs for a specific test ID and serializes them into TestResult objects
 * @param db Database instance
 * @param testId The test ID to fetch results for
 * @returns TestResult[] - Array of serialized test results
 */
export function getSerializedTestResults(db: Database, testId: string): TestResult[] {
    try {
        // Get all test runs for the given test ID
        const testRuns = getTestRunsById(db, testId);

        // Map the test runs to TestResult objects
        return testRuns.map(run => ({
            testName: run.test_name as TestsNames,
            testStatus: run.status,
            error: run.error || undefined,
            duration_ms: run.duration_ms || undefined
        }));
    } catch (error) {
        console.error('Error serializing test results:', error);
        throw error; // Re-throw to allow caller to handle the error
    }
}

// Example usage:
// const db = initializeSQLite();
// const testId = 'your-test-id';
// try {
//     const results = getSerializedTestResults(db, testId);
//     console.log('Serialized test results:', results);
// } catch (error) {
//     console.error('Failed to get test results:', error);
// }
