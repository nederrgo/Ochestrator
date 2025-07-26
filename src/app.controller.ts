import { Body, Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { RunTestDto } from './dto/run.test.dto';
import { testDictionary } from './data-dictionary/test.data.dictionary';
import { TestMetadataDto } from './dto/test.metadata.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post("runTest")
  runTest(@Body() runTestDto: RunTestDto): string {
    try {
      if (!runTestDto.testPart || runTestDto.testPart.length === 0) {
        throw new Error('No test part provided');
      }
      const testMetadata: TestMetadataDto[] = [];
      const partsNames: string[] = [];
      runTestDto.testPart.forEach(testPart => {
        if(!testDictionary.has(testPart)){
          return;
        }
        partsNames.push(testPart);
        testMetadata.push(testDictionary.get(testPart)!);
      });

      if (testMetadata.length === 0) {
        throw new Error(`No test found for any of the parts: ${runTestDto.testPart}`);
      }

      this.appService.runTest(testMetadata);
      return "Test run successfully for parts: " + partsNames.join(", ");
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: error.message || 'An error occurred while processing your request' }, HttpStatus.BAD_REQUEST);
    }
  }
}
