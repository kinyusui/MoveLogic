import * as fs from "fs";
import * as path from "path";
import { configMyStatusBar, MyStatusBar } from "../Extension/MyStatusBar";
import { configMakeNewPath, getFullPaths, MakeNewPath } from "../makePath";
import { RemoveEmptyDir } from "../RemoveEmptyDir";
import { updateImports, UpdateImports } from "./UpdateImports/UpdateImports";

const makePathPossible = (filePath: string) => {
  const dirPath = path.dirname(filePath);
  const dirMissing = !fs.existsSync(dirPath);
  if (dirMissing) {
    makePathPossible(dirPath);
    fs.mkdirSync(dirPath);
  }
};
type MakePathPossible = typeof makePathPossible;

type Props = {
  oldDirPath: string;
  makeNewPath: MakeNewPath;
  removeDirer: RemoveEmptyDir;
  updateImports: UpdateImports;
  statusBar: MyStatusBar;
  makePathPossible: MakePathPossible;
};

export class MoveLogic {
  constructor(public props: Props) {}
  _moveFile = async (sourceFile: string) => {
    // Normalize paths
    const { makeNewPath, updateImports, makePathPossible, statusBar } = this.props;
    const moveTargetPath: string = path.normalize(sourceFile);
    const endFilePath = makeNewPath(sourceFile);
    makePathPossible(endFilePath);
    await fs.promises.rename(moveTargetPath, endFilePath);
    await updateImports(moveTargetPath, endFilePath);

    statusBar.updateProgress();
  };

  moveFile = async (sourceFile: string) => {
    const { statusBar } = this.props;
    statusBar.start(1);
    await this._moveFile(sourceFile);
    statusBar.end();
  };

  _moveDir = async (oldDirPath: string) => {
    const filePaths = getFullPaths(oldDirPath);
    const { statusBar } = this.props;
    statusBar.start(filePaths.length);

    for (const filePath of filePaths) {
      await this._moveFile(filePath);
    }

    statusBar.end();
  };

  moveDir = async () => {
    const { oldDirPath, removeDirer } = this.props;
    await this._moveDir(oldDirPath);
    await removeDirer.removeEmptyDir(oldDirPath);
  };
}

const configMakeMoveMessage = (total: number) => {
  return (progress: number) => {
    const percent = 100 * (progress / total);
    const shortPercent = percent.toFixed(3);
    return `Moved ${progress}/${total} item(s). ${shortPercent}`;
  };
};

type Config = {
  oldDirPath: string;
  newDirPath: string;
};
export const configMoveLogic = ({ oldDirPath, newDirPath }: Config) => {
  const removeDirer = new RemoveEmptyDir();
  const makeNewPath = configMakeNewPath(oldDirPath, newDirPath);
  const statusBar = configMyStatusBar({ configMessageMaker: configMakeMoveMessage });

  return new MoveLogic({
    oldDirPath,
    makeNewPath,
    removeDirer,
    updateImports,
    statusBar,
    makePathPossible: makePathPossible,
  });
};
