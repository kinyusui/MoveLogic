import { MakePathPossible, makePathPossible } from "src/vscodeFunctions/Editor/Edit";
import { rootLoggerHandler } from "../Extension/Logger";
import { configMyStatusBar, MyStatusBar } from "../Extension/MyStatusBar";
import { configRemoveEmtpyDir, RemoveEmptyDir } from "../Extension/RemoveEmptyDir";
import { path } from "../Nonvscode/MakeDependencyEasy";
import { configMakeNewPath, getFullPaths, MakeNewPath } from "../Nonvscode/makePath";
import { EditorFunctions } from "../vscodeFunctions/Editor/UndoableEdit";

type Props = {
  oldDirPath: string;
  makeNewPath: MakeNewPath;
  removeDirer: RemoveEmptyDir;
  statusBar: MyStatusBar;
  makePathPossible: MakePathPossible;
  undoableEdit: EditorFunctions;
};

type Args<TArg> = TArg[];
type MoverForStatusBar<TArg> = (...filePath: Args<TArg>) => Promise<void>;
type Command<TArg> = [MoverForStatusBar<TArg>, Args<TArg>];

export class MoveLogic {
  constructor(public props: Props) {}
  _moveFile = async (sourceFile: string) => {
    // Normalize paths
    const { makeNewPath, makePathPossible, statusBar } = this.props;
    const { undoableEdit } = this.props;
    const moveTargetPath: string = path.normalize(sourceFile);
    const endFilePath = makeNewPath(sourceFile);
    makePathPossible(endFilePath);
    rootLoggerHandler.logDebugMessage(`made path for ${endFilePath}`);
    // await fs.promises.rename(moveTargetPath, endFilePath);
    // await MyFs.rename(moveTargetPath, endFilePath);
    await undoableEdit.renameFile(moveTargetPath, endFilePath);

    // await updateImports(moveTargetPath, endFilePath);

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
      rootLoggerHandler.logDebugMessage(err);
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
  undoableEdit: EditorFunctions;
};
export const configMoveLogic = ({ oldDirPath, newDirPath, undoableEdit }: Config) => {
  // const undoableEdit = rootUndoableEdit; //configUndoableEdit();
  const removeDirer = configRemoveEmtpyDir({ undoableEdit });
  const makeNewPath = configMakeNewPath(oldDirPath, newDirPath);
  const statusBar = configMyStatusBar({ configMessageMaker: configMakeMoveMessage });

  return new MoveLogic({
    oldDirPath,
    makeNewPath,
    removeDirer: removeDirer,
    statusBar,
    makePathPossible: makePathPossible,
    undoableEdit: undoableEdit,
  });
};
