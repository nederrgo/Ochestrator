import { TestsNames } from "./testsNames";

export interface TestResult {
    testName:TestsNames;
    testStatus:string;
    error?:string;
    duration_ms?:number;
}