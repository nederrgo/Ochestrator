import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { RunTestDto } from './dto/run.test.dto';
import { testDictionary } from './data-dictionary/test.data.dictionary';
import { TestMetadataDto } from './dto/test.metadata.dto';
import { RunnerReplayDto } from './dto/runner.replay.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post("runTest")
  async runTest(@Body() runTestDto: RunTestDto): Promise<string> {
    try {
      if (!runTestDto.testPart || runTestDto.testPart.length === 0) {
        throw new Error('No test part provided');
      }
      const testMetadata: TestMetadataDto[] = [];
      const partsNames: string[] = [];
      runTestDto.testPart.forEach(testPart => {
        if (!testDictionary.has(testPart)) {
          return;
        }
        partsNames.push(testPart);
        testMetadata.push(testDictionary.get(testPart)!);
      });

      if (testMetadata.length === 0) {
        throw new Error(`No test found for any of the parts: ${runTestDto.testPart}`);
      }

      const result = await this.appService.runTest(testMetadata);
      return result;
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: error.message || 'An error occurred while processing your request' }, HttpStatus.BAD_REQUEST);
    }
  }
  @Post("replyTest")
  @ApiOperation({ summary: 'Replay tests with the given test data' })
  @ApiBody({
    type: [RunnerReplayDto],
    description: 'Array of test data to replay',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Tests replayed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async replyTest(@Body() runTestDto: RunnerReplayDto[]): Promise<string> {
    try {
      if (!runTestDto || runTestDto.length === 0) {
        throw new Error('No test id provided');
      }

      await this.appService.ReplyTest(runTestDto);
      return "Test run successfully for parts: " + runTestDto.map(test => test.testId).join(", ");
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: error.message || 'An error occurred while processing your request' }, HttpStatus.BAD_REQUEST);
    }
  }
}
