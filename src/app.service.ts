import { Injectable } from '@nestjs/common';
import { RunTestDto } from './dto/run.test.dto';
import { TestMetadataDto } from './dto/test.metadata.dto';
import axios from "axios";
import { testRunnerDictionary } from './data-dictionary/runner.soure';
import { RunnerReplayDto } from './dto/runner.replay.dto';
import { RunnerRequestDto } from './dto/runner.request.dto';
import { randomUUID } from 'crypto';
import { db } from './main';
import { upsertTestRun } from './utils/sql-lite/sql.lite';
@Injectable()
export class AppService {
  runTest(runTestSDto: TestMetadataDto[]) {
    const testId = randomUUID();
    runTestSDto.forEach(test => {
      const runnerUrl = testRunnerDictionary.get(test.testRunner);
      console.log(test.testSearchName);
      upsertTestRun(db, {
        test_id: testId,
        test_name: test.testName,
        test_search_name: test.testSearchName,
        status: 'pending',
        start_time: new Date().toISOString(),
        test_sequence: test.testSequence?.join(",") || "[]"
      });
      const runnerRequest: RunnerRequestDto = {
        testId,
        testSearchName: test.testSearchName
      }
      axios.post(runnerUrl!, runnerRequest)
    });
    return "Test run successfully for parts: " + runTestSDto.map(test => test.testSearchName).join(", ");
  }

  ReplyTest(runTestSDto: RunnerReplayDto[]) {

  }
}
