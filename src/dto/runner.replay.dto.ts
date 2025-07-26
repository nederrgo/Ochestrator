import { Optional } from "@nestjs/common";
import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class RunnerReplayDto {
    @ApiProperty()
    @IsString()
    testId: string;
    @ApiProperty()
    @IsString()
    status: string;
    @ApiProperty()
    @Optional()
    @IsString()
    error?: string;
}   