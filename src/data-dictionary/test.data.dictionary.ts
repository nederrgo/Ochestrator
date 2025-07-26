import { TestsNames } from "src/types/testsNames";
import { TestRunner, TestEnv, TestMetadataDto } from "../dto/test.metadata.dto";


export const testDictionary = new Map<TestsNames, TestMetadataDto>([
    [
        TestsNames.test1, {
            testName: TestsNames.test1,
            testRunner: TestRunner.playwright,
            testEnv: TestEnv.default,
            testSearchName: "common tests",
            testSequence: [TestsNames.test2, TestsNames.common]
        }
    ],
    [
        TestsNames.test2, {
            testName: TestsNames.test2,
            testRunner: TestRunner.playwright,
            testEnv: TestEnv.default,
            testSearchName: "common tests",
            testSequence: [TestsNames.test3]
        }
    ],
    [
        TestsNames.test3, {
            testName: TestsNames.test3,
            testRunner: TestRunner.playwright,
            testEnv: TestEnv.default,
            testSearchName: "common tests",
            testSequence: []
        }
    ],
    [
        TestsNames.common, {
            testName: TestsNames.common,
            testRunner: TestRunner.jest,
            testEnv: TestEnv.env1,
            testSearchName: "common tests",
            testSequence: []
        }
    ]
]);

