import { Injectable } from '@nestjs/common';
import { TestMetadataDto } from './dto/test.metadata.dto';
import axios from "axios";
import { testRunnerDictionary } from './data-dictionary/runner.soure';
import { RunnerReplayDto } from './dto/runner.replay.dto';
import { RunnerRequestDto } from './dto/runner.request.dto';
import { randomUUID } from 'crypto';
import { db } from './main';
import { getTestRunsByIdAndTestSearchName, upsertTestRun } from './utils/sql-lite/sql.lite';
import { TestsNames } from './types/testsNames';
import { testDictionary } from './data-dictionary/test.data.dictionary';
import { areAllTestRunsComplete } from './utils/sql.lite.utils';
import { getSerializedTestResults } from './utils/sender.data.seirliaze';
@Injectable()
export class AppService {
  async runTest(runTestSDto: TestMetadataDto[], testId?: string) {
    const testIdValue = testId || randomUUID();
    const success: string[] = [];

    await Promise.all(runTestSDto.map(async (test) => {
      const runnerUrl = testRunnerDictionary.get(test.testRunner);
      console.log(`Starting test: ${test.testSearchName}`);

      // Update test run status to pending
      upsertTestRun(db, {
        test_id: testIdValue,
        test_name: test.testName,
        test_search_name: test.testSearchName,
        status: 'pending',
        start_time: new Date().toISOString(),
        test_sequence: JSON.stringify(test.testSequence) || "[]"
      });

      const runnerRequest: RunnerRequestDto = {
        testId: testIdValue,
        testName: test.testName,
        testSearchName: test.testSearchName
      };

      try {
        await axios.post(runnerUrl!, runnerRequest);
        success.push(test.testName);
      } catch (err) {
        upsertTestRun(db, {
          test_id: testIdValue,
          test_name: test.testName,
          test_search_name: test.testSearchName,
          status: 'error',
          end_time: new Date().toISOString(),
          error: err.message,
          duration_ms: 0,
          test_sequence: JSON.stringify(test.testSequence) || "[]"
        });
      }
    }));
    return "Test run successfully for parts: " + success.join(",");
  }

  async ReplyTest(runTestSDto: RunnerReplayDto[]) {
    const testRuns = getTestRunsByIdAndTestSearchName(db, runTestSDto[0].testId, runTestSDto[0].testName);
    upsertTestRun(db, {
      test_id: runTestSDto[0].testId,
      test_name: runTestSDto[0].testName,
      test_search_name: runTestSDto[0].testName,
      status: runTestSDto[0].status,
      end_time: new Date().toISOString(),
      error: runTestSDto[0].error,
      duration_ms: new Date().getTime() - new Date(testRuns.start_time!).getTime(),
      test_sequence: testRuns.test_sequence
    });
    const testSequence: TestsNames[] = JSON.parse(testRuns.test_sequence!);
    const testMetadataDto: TestMetadataDto[] = [];

    if (testSequence.length > 0 && runTestSDto[0].status === "passed") {
      for (const test of testSequence) {
        testMetadataDto.push(testDictionary.get(test)!)
      }
    }
    const areAllTestsCompleted = await areAllTestRunsComplete(db, runTestSDto[0].testId);

    if (areAllTestsCompleted && testMetadataDto.length === 0) {
      try {
        const testResults = getSerializedTestResults(db, runTestSDto[0].testId);
        await axios.post("http://localhost:3000/Sender", testResults);
      } catch (error) {
        throw error;
      }
    }
    if(testMetadataDto.length > 0){
      await this.runTest(testMetadataDto, runTestSDto[0].testId);
    }
  }
}
