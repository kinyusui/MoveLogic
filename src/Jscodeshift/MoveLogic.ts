import { rootLoggerHandler } from "../Extension/Logger.js";
import { configMyStatusBar, MyStatusBar } from "../Extension/MyStatusBar.js";
import {
  makePathPossible,
  MakePathPossible,
} from "../Extension/NoUndoButStable/Edit.js";
import { EditorFunctions } from "../Extension/UndoableButBuggy/EditorFunctions.type.js";
import { path } from "../Nonvscode/MakeDependencyEasy.js";
import {
  configMakeNewPath,
  getFullPathsAny,
  MakeNewPath,
} from "../Nonvscode/makePath.js";
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
    const endFilePath = makeNewPath(sourceFile);
    const noWorkNeeded = !MyFs.existSync(moveTargetPath);
    if (noWorkNeeded) return;

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
    } catch (err: any) {
      rootLoggerHandler.logDebugMessage(`Error on top move: ${err}`);
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

export const configMakeMoveMessage = (total: number) => {
  return (progress: number) => {
    const percent = 100 * (progress / total);
    const shortPercent = percent.toFixed(3);
    return `Moved ${progress}/${total} item(s). ${shortPercent}`;
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
