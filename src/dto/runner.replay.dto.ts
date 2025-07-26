import { IsOptional, IsString } from "class-validator";
import { ApiBody, ApiProperty } from "@nestjs/swagger";

export class RunnerReplayDto {
    @ApiProperty()
    @IsString()
    testId: string;
    @ApiProperty()
    @IsString()
    testName: string;
    @ApiProperty()
    @IsString()
    status: string;
    @ApiProperty()
    @IsOptional()
    @IsString()
    error?: string;
}   