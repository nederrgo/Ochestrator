import { TestsNames } from "../types/testsNames";

export interface RunnerRequestDto {
    testId: string;
    testName: TestsNames;
    testSearchName: string;
}