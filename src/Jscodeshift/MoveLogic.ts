import { rootLoggerHandler } from "../Extension/Logger.js";
import { configMyStatusBar, MyStatusBar } from "../Extension/MyStatusBar.js";
import {
  makePathPossible,
  MakePathPossible,
} from "../Extension/NoUndoButStable/Edit.js";
import { configRemoveEmtpyDir, RemoveEmptyDir } from "../Extension/RemoveEmptyDir.js";
import { EditorFunctions } from "../Extension/UndoableButBuggy/EditorFunctions.type.js";
import { path } from "../Nonvscode/MakeDependencyEasy.js";
import { configMakeNewPath, getFullPaths, MakeNewPath } from "../Nonvscode/makePath.js";
import { MyFs } from "../vscodeFunctions/MyFS.js";

type Props = {
  oldDirPath: string;
  makeNewPath: MakeNewPath;
  removeDirer: RemoveEmptyDir;
  statusBar: MyStatusBar;
  makePathPossible: MakePathPossible;
  editor: EditorFunctions;
};

type Args<TArg> = TArg[];
type MoverForStatusBar<TArg> = (...filePath: Args<TArg>) => Promise<void>;
type Command<TArg> = [MoverForStatusBar<TArg>, Args<TArg>];

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
    const task: Command<string> = [this._moveFile, [sourceFile]];
    await this.withStatusBar(task);
  };

  _moveDir = async (filePaths: string[]) => {
    for (const filePath of filePaths) {
      await this._moveFile(filePath);
    }
  };

  withStatusBar = async <TArg>([task, taskArg]: Command<TArg>) => {
    const { statusBar } = this.props;
    try {
      const workLength = Array.isArray(taskArg) ? taskArg.length : 1;
      statusBar.start(workLength);
      await task(...taskArg);
    } catch (err: any) {
      rootLoggerHandler.logDebugMessage(`Error on top move: ${err}`);
    } finally {
      statusBar.end();
    }
  };

  moveDir = async () => {
    const { oldDirPath, removeDirer } = this.props;
    const filePaths = getFullPaths(oldDirPath);
    const task: Command<string[]> = [this._moveDir, [filePaths]];
    await this.withStatusBar(task);
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
  const removeDirer = configRemoveEmtpyDir({ editor: editor });
  const makeNewPath = configMakeNewPath(oldDirPath, newDirPath);
  const statusBar = configMyStatusBar({ configMessageMaker: configMakeMoveMessage });

  return new MoveLogic({
    oldDirPath,
    makeNewPath,
    removeDirer: removeDirer,
    statusBar,
    makePathPossible: makePathPossible,
    editor: editor,
  });
};
