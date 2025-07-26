import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TestsNames } from 'src/types/testsNames';

export class RunTestDto {
    @ApiProperty()
    @IsEnum(TestsNames, { each: true })
    testPart: TestsNames[];
}
