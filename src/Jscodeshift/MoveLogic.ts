import { configMyStatusBar, MyStatusBar } from "../Extension/MyStatusBar.js";
import {
  makePathPossible,
  MakePathPossible,
} from "../Extension/NoUndoButStable/Edit.js";
import { EditorFunctions } from "../Extension/UndoableButBuggy/EditorFunctions.type.js";
import {
  configMakeNewPath,
  getFullPathsAny,
  MakeNewPath,
} from "../Nonvscode/makePath.js";
import { path } from "../vscodeFunctions/MakeDependencyEasy.js";
import { MyFs } from "../vscodeFunctions/MyFS.js";

type Props = {
  oldDirPath: string;
  makeNewPath: MakeNewPath;
  statusBar: MyStatusBar;
  makePathPossible: MakePathPossible;
  editor: EditorFunctions;
};

type MoverForStatusBar = (...filePath: string[]) => Promise<void>;
type Command = [MoverForStatusBar, string[]];

export class MoveLogic {
  constructor(public props: Props) {}
  _moveFile = async (sourceFile: string) => {
    // Normalize paths
    const { makeNewPath, makePathPossible, statusBar } = this.props;
    const { editor } = this.props;
    const moveTargetPath: string = path.normalize(sourceFile);
    const noWorkNeeded = !MyFs.existSync(moveTargetPath);
    if (noWorkNeeded) return;

    const endFilePath = makeNewPath(sourceFile);
    makePathPossible(endFilePath);

    await editor.renameFile(moveTargetPath, endFilePath);

    statusBar.updateProgress();
  };

  moveFile = async (sourceFile: string) => {
    const task: Command = [this._moveFile, [sourceFile]];
    await this.withStatusBar(task);
  };

  _moveDir = async (...filePaths: string[]) => {
    for (const filePath of filePaths) {
      await this._moveFile(filePath);
    }
  };

  withStatusBar = async ([task, taskArg]: Command) => {
    const { statusBar } = this.props;
    try {
      const workLength = taskArg.length;
      statusBar.start(workLength);
      await task(...taskArg);
    } finally {
      statusBar.end();
    }
  };

  moveDir = async () => {
    const { oldDirPath, editor } = this.props;
    const filePaths = getFullPathsAny(oldDirPath);
    const task: Command = [this._moveDir, filePaths];
    await this.withStatusBar(task);
    await editor.removeEmptyDir(oldDirPath);
    // await removeDirer.removeEmptyDir(oldDirPath);
  };
}

const formatMillisecondsWithDate = (ms: number): string => {
  const invalidMs = !ms || ms < 0;
  if (invalidMs) return "00:00:00";

  // Create a date object. The milliseconds are treated as an offset from the UTC epoch.
  const date = new Date(ms);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};

export type ConfigMessageMaker = (total: number) => (progress: number) => string;
export type MessageMaker = ReturnType<ConfigMessageMaker>;

const milisecondsToSeconds = (num: number) => (num / 1000).toFixed(3);
export const configMakeMoveMessage: ConfigMessageMaker = (total: number) => {
  const start = performance.now();
  const startDateMs = new Date().getTime();
  return (progress: number) => {
    const percentDecimal = progress / total;
    const percent = 100 * percentDecimal;

    const timeElapsed = performance.now() - start;
    const totalTimeNeeded = timeElapsed * (1 / percentDecimal);
    const timeLeft = totalTimeNeeded - timeElapsed;
    const doneAtTime = startDateMs + totalTimeNeeded;

    const timeElapsedInSeconds = milisecondsToSeconds(timeElapsed);
    const shortPercent = percent.toFixed(3);
    const totalTimeNeededInSeconds = milisecondsToSeconds(totalTimeNeeded);
    const timeLeftInSeconds = milisecondsToSeconds(timeLeft);
    const doneAtTimeString = formatMillisecondsWithDate(doneAtTime);
    return (
      `Moved ${progress}/${total} item(s). ${shortPercent}% complete.` +
      `\n--Done At: ${doneAtTimeString}` +
      `\n--Time Elapsed: ${timeElapsedInSeconds} seconds.` +
      `\n--Total Time Needed: ${totalTimeNeededInSeconds}s.` +
      `\n--Time Left: ${timeLeftInSeconds}s`
    );
  };
};

export type Config = {
  oldDirPath: string;
  newDirPath: string;
  editor: EditorFunctions;
};
export const configMoveLogic = ({ oldDirPath, newDirPath, editor }: Config) => {
  // const undoableEdit = rootUndoableEdit; //configUndoableEdit();
  const makeNewPath = configMakeNewPath(oldDirPath, newDirPath);
  const statusBar = configMyStatusBar({ configMessageMaker: configMakeMoveMessage });

  return new MoveLogic({
    oldDirPath,
    makeNewPath,
    statusBar,
    makePathPossible: makePathPossible,
    editor: editor,
  });
};
