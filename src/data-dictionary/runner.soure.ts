import { TestRunner } from "../dto/test.metadata.dto";

export const testRunnerDictionary = new Map<TestRunner, string>([
    [TestRunner.playwright, "http://localhost:3000/runner1"],
    [TestRunner.jest, "http://localhost:3000/runner2"],
    [TestRunner.cypress, "http://localhost:3000/runner3"],
    [TestRunner.mocha, "http://localhost:3000/runner4"],
    [TestRunner.xunit, "http://localhost:3000/runner5"]
]);

