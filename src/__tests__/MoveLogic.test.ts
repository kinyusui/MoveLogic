import * as fs from "fs-extra";
import { describe, expect } from "vitest";
import { configMakeAbsolute, getFullPaths } from "../makePath";
import { configMoveLogic } from "../TsMorph/MoveLogic";
import { makeTestProject } from "./Project";

const makeTestMoveLogic = () => {
  const project = makeTestProject();
  return configMoveLogic({ project, log: false });
};

const moveLogic = makeTestMoveLogic();

const makeAbsolute = configMakeAbsolute({ posix: true });

function compareDirsText(folder1: string, folder2: string): boolean {
  const files1 = getFullPaths(folder1).sort();
  const files2 = getFullPaths(folder2).sort();

  if (files1.length !== files2.length) return false;

  for (let i = 0; i < files1.length; i++) {
    const filePaths = [files1[i], files2[i]];
    const [content1, content2] = filePaths.map((path) => fs.readFileSync(path));
    const mismatch = !content1.equals(content2);
    if (mismatch) return false;
  }
  return true;
}

describe("move logic handles nested.", async () => {
  const experiment = makeAbsolute("./Experiment");
  const starterPath = makeAbsolute("./CorrectRef/Start");
  await fs.emptyDir(experiment);
  await fs.copy(starterPath, experiment);

  const doMove = () => {
    const experimentPaths = {
      from: makeAbsolute("./Experiment/0. Old"),
      to: makeAbsolute("./Experiment/1. New"),
    };
    const { project } = moveLogic.props;
    project.addSourceFilesAtPaths(`${experiment}/**/*.ts`);
    moveLogic.moveDir(experimentPaths.from, experimentPaths.to);
  };

  const checkMatch = () => {
    const resultDir = makeAbsolute("./Experiment");
    const answerDir = makeAbsolute("./CorrectRef/End");
    const match = compareDirsText(resultDir, answerDir);
    return match;
  };

  const testMoveLogic = async () => {
    doMove();
    const match = checkMatch();
    expect(match).to.be.true;
  };
  await testMoveLogic();
});
