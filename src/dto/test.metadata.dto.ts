import { TestsNames } from "src/types/testsNames";

export interface TestExecuteMetadataDto {
    testId: string;
    testMetadata: TestMetadataDto;
}
export interface TestMetadataDto {
    testName: TestsNames;
    testRunner: TestRunner;
    testEnv: TestEnv;
    testSearchName: string;
    testSequence?: TestsNames[];
}

export enum TestRunner {
    playwright,
    jest,
    cypress,
    mocha,
    xunit
}
export enum TestEnv {
    default,
    env1,
    env2
}